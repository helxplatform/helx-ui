pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh '''
                make install.ci
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                make test
                '''
            }
        }
        stage('Publish') {
            when {
                tag "release-*"
            }
            steps {
                sh '''
                make build
                make publish
                '''
            }
        }
    }
}