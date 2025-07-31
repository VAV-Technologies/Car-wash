#!/usr/bin/env python3
"""
Setup script for Professional Supabase Backup Tool
Handles installation and configuration automatically
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors professionally"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} error: {e}")
        return False

def check_python_version():
    """Ensure Python 3.8+ is being used"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """Install required Python packages"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    return run_command(
        f"pip install -r {requirements_file}",
        "Installing Python dependencies"
    )

def create_config_from_existing():
    """Create Python-compatible config from existing bash config"""
    bash_config = Path(__file__).parent / "config.env"
    python_config = Path(__file__).parent / ".env"
    
    if bash_config.exists():
        print("📋 Converting existing bash config to Python format...")
        
        # Read bash config
        bash_vars = {}
        with open(bash_config, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Clean up bash array syntax and quotes
                    value = value.strip().strip('"').strip("'")
                    if value.startswith('(') and value.endswith(')'):
                        # Convert bash array to space-separated string
                        value = value[1:-1].replace('"', '').replace("'", "")
                    bash_vars[key] = value
        
        # Write Python-compatible .env file
        with open(python_config, 'w') as f:
            f.write("# Professional Supabase Backup Tool Configuration\n")
            f.write("# Auto-converted from bash config\n\n")
            
            for key, value in bash_vars.items():
                f.write(f"{key}={value}\n")
        
        print(f"✅ Configuration saved to {python_config}")
        return True
    else:
        print("⚠️  No existing config found. You'll need to create .env manually")
        return False

def make_executable():
    """Make the backup tool executable"""
    backup_tool = Path(__file__).parent / "backup_tool.py"
    if backup_tool.exists():
        os.chmod(backup_tool, 0o755)
        print("✅ Made backup_tool.py executable")
        return True
    return False

def test_installation():
    """Test the installation"""
    return run_command(
        "python backup_tool.py --help",
        "Testing installation"
    )

def main():
    print("=" * 60)
    print("  Professional Supabase Backup Tool Setup")
    print("=" * 60)
    print()
    
    success = True
    
    # Check Python version
    if not check_python_version():
        success = False
    
    # Install dependencies
    if success and not install_dependencies():
        success = False
    
    # Create config
    if success:
        create_config_from_existing()
    
    # Make executable
    if success:
        make_executable()
    
    # Test installation
    if success and test_installation():
        print()
        print("🎉 Setup completed successfully!")
        print()
        print("Usage:")
        print("  python backup_tool.py --help")
        print("  python backup_tool.py --verify")
        print("  python backup_tool.py --storage-only")
        print()
        print("Configuration:")
        print("  Edit .env file to customize settings")
        print()
    else:
        print()
        print("❌ Setup failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()