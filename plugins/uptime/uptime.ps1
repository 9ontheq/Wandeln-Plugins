$up = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
"⏱ {0}d {1}h" -f $up.Days, $up.Hours
"Time since last boot"
