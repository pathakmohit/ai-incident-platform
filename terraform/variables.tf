variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "ai-incident"
}

# Amazon Linux 2023 AMI for us-east-1 (Free Tier)
variable "ami_id" {
  description = "EC2 AMI ID (Amazon Linux 2023)"
  type        = string
  default     = "ami-0c02fb55956c7d316"
}

variable "key_pair_name" {
  description = "Name of existing EC2 key pair for SSH access"
  type        = string
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}
