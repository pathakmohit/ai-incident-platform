output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "rds_endpoint" {
  description = "RDS endpoint (use as DB_HOST)"
  value       = aws_db_instance.mysql.address
  sensitive   = true
}

output "app_url" {
  description = "Frontend URL"
  value       = "http://${aws_instance.app_server.public_ip}:3000"
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.app_server.public_ip}:5000"
}
