from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def create_data_model(blocked_location=None):
    """Stores the data for the routing problem."""
    data = {}
    
    # 0: Mumbai, 1: Panvel, 2: Expressway, 3: Old Highway, 4: Pune
    # The numbers represent travel time in minutes between nodes.
    # 999 means there is no direct road between those nodes.
    matrix = [
        [0, 60, 999, 999, 999],     # 0: Mumbai -> Panvel
        [60, 0, 45, 65, 999],       # 1: Panvel -> Expressway (45m) OR Old Highway (65m)
        [999, 45, 0, 999, 70],      # 2: Expressway -> Pune
        [999, 65, 999, 0, 85],      # 3: Old Highway -> Pune
        [999, 999, 70, 85, 0]       # 4: Pune (End)
    ]

    # IF GEMINI DETECTS A BLOCKAGE, WE APPLY THE MATHEMATICAL PENALTY
    if blocked_location in ["Mumbai-Pune Expressway", "Khandala"]:
        print("⚠️ OR-TOOLS: Blockade detected! Applying penalty to Expressway nodes...")
        matrix[1][2] = 99999  # Panvel to Expressway is blocked
        matrix[2][4] = 99999  # Expressway to Pune is blocked

    data['distance_matrix'] = matrix
    data['num_vehicles'] = 1
    data['depot'] = 0 # Start at Mumbai (Node 0)
    return data

def calculate_detour(blocked_location=None):
    """Runs the OR-Tools VRP solver to find the optimal route."""
    data = create_data_model(blocked_location)
    
    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Setting first solution heuristic
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

    # Solve the problem
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        index = routing.Start(0)
        route = []
        route_time = 0
        
        # Node mapping for human-readable output
        node_names = {0: "Mumbai", 1: "Panvel", 2: "Expressway", 3: "Old Highway", 4: "Pune"}
        
        while not routing.IsEnd(index):
            node_id = manager.IndexToNode(index)
            route.append(node_names[node_id])
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_time += routing.GetArcCostForVehicle(previous_index, index, 0)
            
        route.append(node_names[manager.IndexToNode(index)]) # Add destination
        
        return {
            "status": "Success",
            "optimal_route": " -> ".join(route),
            "estimated_time_minutes": route_time
        }
    else:
        return {"status": "Failed", "message": "No route found."}