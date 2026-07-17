pipeline {
    agent any
    environment {
        COMPOSE_FILE = 'docker-compose.prod.yml'
        COMPOSE_PROJECT_NAME = 'cinema'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Setup Env') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV'),
                    file(credentialsId: 'root-env', variable: 'ROOT_ENV')
                ]) {
                    sh 'cp $BACKEND_ENV backend/.env'
                    sh 'cp $FRONTEND_ENV frontend/.env'
                    sh 'cp $ROOT_ENV .env'
                }
            }
        }
        stage('Build') {
            steps {
                sh 'docker-compose build --no-cache'
            }
        }
        stage('Trivy Scan') {
            steps {
                sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL cinema_backend || true'
                sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL cinema_frontend || true'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }
    post {
        always {
            sh 'docker-compose ps'
        }
        success {
            echo 'Deploy thanh cong!'
        }
        failure {
            echo 'Pipeline that bai, kiem tra log!'
            sh 'docker-compose logs --tail 50'
        }
    }
}