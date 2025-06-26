# Windows Firewall Internet Restriction Script
# Run as Administrator

param(
    [string[]]$AllowedURLs = @(
        "*.microsoft.com",
        "*.windows.com",
        "*.windowsupdate.com",
        "*.google.com",
        "*.anydesk.com"
        # Add your allowed URLs here
    )
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator!"
    exit 1
}

Write-Host "Starting Windows Firewall configuration..." -ForegroundColor Green

# Enable Windows Firewall for all profiles
Write-Host "Enabling Windows Firewall..." -ForegroundColor Yellow
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True -DefaultInboundAction Block -DefaultOutboundAction Block

# Essential Windows services and applications that need internet access
$EssentialApps = @(
    # Windows System processes
    "%SystemRoot%\System32\svchost.exe",
    "%SystemRoot%\System32\wuauclt.exe",
    "%SystemRoot%\System32\WindowsUpdateElevatedInstaller.exe",
    "%SystemRoot%\System32\UsoClient.exe",
    "%SystemRoot%\System32\backgroundTaskHost.exe",
    "%SystemRoot%\System32\wsqmcons.exe",
    "%SystemRoot%\System32\RuntimeBroker.exe",
    "%SystemRoot%\System32\dllhost.exe",
    "%SystemRoot%\System32\spoolsv.exe",
    "%SystemRoot%\System32\lsass.exe",
    "%SystemRoot%\System32\winlogon.exe",
    "%SystemRoot%\System32\csrss.exe",
    
    # Network and system services
    "%SystemRoot%\System32\netsh.exe",
    "%SystemRoot%\System32\ping.exe",
    "%SystemRoot%\System32\nslookup.exe",
    "%SystemRoot%\System32\telnet.exe",
    
    # Chrome browsers (common installation paths)
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe",
    
    # AnyDesk
    "${env:ProgramFiles}\AnyDesk\AnyDesk.exe",
    "${env:ProgramFiles(x86)}\AnyDesk\AnyDesk.exe",
    "${env:LOCALAPPDATA}\AnyDesk\AnyDesk.exe",
    
    # Windows Store and related
    "%SystemRoot%\System32\WWAHost.exe",
    "%SystemRoot%\System32\ApplicationFrameHost.exe",
    
    # Print spooler
    "%SystemRoot%\System32\PrintIsolationHost.exe"
)

# Remove existing outbound rules to start fresh
Write-Host "Removing existing custom firewall rules..." -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "Allow*Custom*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue

# Allow essential Windows services outbound
Write-Host "Creating rules for essential Windows services..." -ForegroundColor Yellow

# Allow Windows Update
New-NetFirewallRule -DisplayName "Allow Windows Update Custom" -Direction Outbound -Protocol TCP -RemotePort 80,443 -Program "%SystemRoot%\System32\svchost.exe" -Action Allow
New-NetFirewallRule -DisplayName "Allow Windows Update Client Custom" -Direction Outbound -Protocol TCP -RemotePort 80,443 -Program "%SystemRoot%\System32\wuauclt.exe" -Action Allow
New-NetFirewallRule -DisplayName "Allow UsoClient Custom" -Direction Outbound -Protocol TCP -RemotePort 80,443 -Program "%SystemRoot%\System32\UsoClient.exe" -Action Allow

# Allow DNS resolution
New-NetFirewallRule -DisplayName "Allow DNS Custom" -Direction Outbound -Protocol UDP -RemotePort 53 -Action Allow
New-NetFirewallRule -DisplayName "Allow DNS TCP Custom" -Direction Outbound -Protocol TCP -RemotePort 53 -Action Allow

# Allow DHCP
New-NetFirewallRule -DisplayName "Allow DHCP Custom" -Direction Outbound -Protocol UDP -LocalPort 68 -RemotePort 67 -Action Allow

# Allow NTP (time synchronization)
New-NetFirewallRule -DisplayName "Allow NTP Custom" -Direction Outbound -Protocol UDP -RemotePort 123 -Action Allow

# Allow ping and ICMP
New-NetFirewallRule -DisplayName "Allow Ping Custom" -Direction Outbound -Protocol ICMPv4 -IcmpType 8 -Action Allow
New-NetFirewallRule -DisplayName "Allow ICMP Custom" -Direction Outbound -Protocol ICMPv4 -Action Allow

# Allow applications
foreach ($app in $EssentialApps) {
    $expandedPath = [Environment]::ExpandEnvironmentVariables($app)
    if (Test-Path $expandedPath -ErrorAction SilentlyContinue) {
        $appName = Split-Path $expandedPath -Leaf
        Write-Host "Creating rule for: $appName" -ForegroundColor Cyan
        New-NetFirewallRule -DisplayName "Allow $appName Custom" -Direction Outbound -Program $expandedPath -Action Allow -ErrorAction SilentlyContinue
    }
}

# Function to create URL-based rules (simplified approach using IP ranges for major services)
function Set-URLBasedRules {
    param([string[]]$URLs)
    
    Write-Host "Processing URL-based restrictions..." -ForegroundColor Yellow
    
    # This is a simplified approach - for production use, consider using a proxy server
    # or more sophisticated DNS filtering solution
    
    # Allow major CDN and cloud service IP ranges that host allowed sites
    # Microsoft IP ranges
    New-NetFirewallRule -DisplayName "Allow Microsoft Services Custom" -Direction Outbound -RemoteAddress "20.0.0.0/8","40.0.0.0/8","52.0.0.0/8","104.0.0.0/8" -Action Allow
    
    # Google IP ranges (for Chrome functionality)
    New-NetFirewallRule -DisplayName "Allow Google Services Custom" -Direction Outbound -RemoteAddress "8.8.8.0/24","8.8.4.0/24","74.125.0.0/16","64.233.160.0/19","66.249.80.0/20","72.14.192.0/18","209.85.128.0/17","216.58.192.0/19","216.239.32.0/19","172.217.0.0/16" -Action Allow
    
    Write-Host "Note: For precise URL filtering, consider implementing a proxy server or DNS filtering solution." -ForegroundColor Magenta
}

# Apply URL-based rules
Set-URLBasedRules -URLs $AllowedURLs

# Allow local network communication
Write-Host "Allowing local network communication..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Allow Local Network Custom" -Direction Outbound -RemoteAddress "192.168.0.0/16","10.0.0.0/8","172.16.0.0/12","169.254.0.0/16" -Action Allow

# Allow loopback
New-NetFirewallRule -DisplayName "Allow Loopback Custom" -Direction Outbound -RemoteAddress "127.0.0.0/8" -Action Allow

# Create inbound rules for essential services
Write-Host "Creating inbound rules for essential services..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Allow Inbound DHCP Custom" -Direction Inbound -Protocol UDP -LocalPort 68 -Action Allow
New-NetFirewallRule -DisplayName "Allow Inbound DNS Custom" -Direction Inbound -Protocol UDP -LocalPort 53 -Action Allow
New-NetFirewallRule -DisplayName "Allow Inbound Print Custom" -Direction Inbound -Protocol TCP -LocalPort 9100,515,631 -Action Allow

# Block all other outbound traffic (this should be the last rule)
Write-Host "Creating final block rule for all other traffic..." -ForegroundColor Red
New-NetFirewallRule -DisplayName "Block All Other Outbound Custom" -Direction Outbound -Action Block -Priority 1000

Write-Host "`nFirewall configuration completed!" -ForegroundColor Green
Write-Host "Allowed applications:" -ForegroundColor Cyan
Write-Host "- Google Chrome" -ForegroundColor White
Write-Host "- AnyDesk" -ForegroundColor White
Write-Host "- Windows Update services" -ForegroundColor White
Write-Host "- Ping and network diagnostics" -ForegroundColor White
Write-Host "- Print services" -ForegroundColor White
Write-Host "- Essential Windows services" -ForegroundColor White

Write-Host "`nTo modify allowed URLs, edit the `$AllowedURLs parameter at the top of this script." -ForegroundColor Yellow
Write-Host "To remove these restrictions, run: Get-NetFirewallRule -DisplayName '*Custom*' | Remove-NetFirewallRule" -ForegroundColor Yellow

# Optional: Create a restore script
$RestoreScript = @"
# Restore script - removes custom firewall rules
Get-NetFirewallRule -DisplayName "*Custom*" | Remove-NetFirewallRule
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultOutboundAction Allow
Write-Host "Firewall restrictions removed." -ForegroundColor Green
"@

$RestoreScript | Out-File -FilePath "RestoreFirewall.ps1" -Encoding UTF8
Write-Host "Restore script created: RestoreFirewall.ps1" -ForegroundColor Green