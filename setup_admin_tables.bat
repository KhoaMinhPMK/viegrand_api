@echo off
echo Setting up database tables for admin panel...

REM Run the PHP script to set up tables
php -f ..\api\admin\setup_tables.php

echo Done! Press any key to continue...
pause > nul
