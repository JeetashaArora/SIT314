pipeline {
    agent any 

    environment {
        // Environment variables
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the Git repository
                git 'https://github.com/JeetashaArora/SIT314.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install Node.js dependencies
                dir(APP_DIR) {
                    sh '''
                        #!/bin/bash
                        export PATH=$NODE_HOME/bin:$PATH
                        npm install
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                // Run tests if you have any
                dir(APP_DIR) {
                    sh '''
                        #!/bin/bash
                        export PATH=$NODE_HOME/bin:$PATH
                        npm test
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir(APP_DIR) {
                    sh 'docker build -t your-app-name .'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh '''
                        #!/bin/bash
                        # SSH into EC2 instance and run deployment script
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST << EOF
                            cd $APP_DIR
                            docker stop your-app-container || true
                            docker rm your-app-container || true
                            docker run -d --name your-app-container -p 3000:3000 your-app-name
                        EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
