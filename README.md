# ServerPinger

## Overview
ServerPinger is a simple tool designed to monitor the availability of a server and alert the user via email when the server goes offline or comes back online.

## Features
* **Server Monitoring**: Continuously monitor the status of a target server by periodically sending ping requests
* **Email Notifications**: Send an email notification to the user when the server goes offline or comes back online
* **Easy Configuration**: Configuration is done during the startup process

## Usage
* **Host address**: Enter the IP address or hostname of the server you want to monitor
* **Email Address**: Enter any number of email addresses to receive notifications. Separate each address with a comma
* **Interval**: Enter the interval in seconds between each ping request. Minimum interval is 5 seconds
* **Write log to file?**: Enter 'y' or 'n' to enable or disable logging to a file
* **Send start email?**: Enter 'y' or 'n' to send startup email(s) when pinger starts

## Example
Enter host address: 192.168.1.103
Enter email address(es): test@email.com
Enter interval (default: 5s): 60
Write log to file? (y/n) (default: no): n
Send start email? (y/n) (default: no): n
