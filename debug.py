import json

def validate_birthsigns(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    valid_types = {"flat", "percent"}
    errors = []
    
    for birthsign in data:
        name = birthsign.get("name", "Unknown")
        
        # Validate bonus structure
        if "bonus" in birthsign and isinstance(birthsign["bonus"], dict):
            for stat, details in birthsign["bonus"].items():
                if not isinstance(details, dict) or "value" not in details or "type" not in details:
                    errors.append(f"{name}: Invalid format in bonus for '{stat}'")
                elif details["type"] not in valid_types:
                    errors.append(f"{name}: Invalid type '{details['type']}' in bonus for '{stat}'")
        elif "bonus" in birthsign and birthsign["bonus"] != "":
            errors.append(f"{name}: Bonus must be an object or empty string")

        # Validate enhanced_bonus structure
        if "enhanced_bonus" in birthsign:
            trigger_skills = birthsign["enhanced_bonus"].get("trigger_skills", [])
            effects = birthsign["enhanced_bonus"].get("effects", {})
            
            if not isinstance(trigger_skills, list):
                errors.append(f"{name}: trigger_skills should be a list")
            
            for stat, details in effects.items():
                if not isinstance(details, dict) or "value" not in details or "type" not in details:
                    errors.append(f"{name}: Invalid format in enhanced_bonus for '{stat}'")
                elif details["type"] not in valid_types:
                    errors.append(f"{name}: Invalid type '{details['type']}' in enhanced_bonus for '{stat}'")
                
                # Ensure enhanced_bonus only modifies existing stats
                if stat not in birthsign.get("bonus", {}):
                    errors.append(f"{name}: Enhanced bonus modifies '{stat}', but it's not in the base bonus")
    
    if errors:
        print("Validation Errors:")
        for error in errors:
            print(" -", error)
    else:
        print("All birthsigns are correctly formatted!")

# Call the function with the path to your birthsigns.json file
validate_birthsigns("birthsigns.json")
