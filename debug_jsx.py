
import sys

def check_balance(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()

    stack = []
    
    # We only care about <div> and </div> for now, and maybe DashboardLayout
    # Simplified parser: just regex for <div and </div
    
    # Actually, proper JSX parsing is hard with regex. 
    # But indentation might help or just counting.
    
    # Let's count indentation blocks? 
    # No, let's track tags.
    
    # Tracking conditional blocks { ... } is also important.
    
    # Let's try to just walk through line by line and print the stack depth change?
    
    # Ignore content inside strings?
    
    # Just look for <div and </div.
    
    depth = 0
    for i, line in enumerate(lines):
        line_num = i + 1
        original_line = line
        
        # Remove simple strings? 
        # This is hacky.
        
        # Count occurences
        opens = line.count('<div ') + line.count('<div>') + line.count('<DashboardLayout>')
        closes = line.count('</div>') + line.count('</DashboardLayout>')
        
        prev_depth = depth
        depth += opens - closes
        
        # Special check for our area of interest
        if line_num > 540 and line_num < 610:
            print(f"{line_num}: Depth {prev_depth} -> {depth} : {line.strip()}")
            
        if line_num > 1460:
             print(f"{line_num}: Depth {prev_depth} -> {depth} : {line.strip()}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
