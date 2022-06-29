pipeline {
  agent {
    kubernetes {
        label 'kaniko-build-agent'
        yaml '''
kind: Pod
metadata:
  name: kaniko
spec:
  containers:
  - name: jnlp
    workingDir: /home/jenkins/agent
  - name: kaniko
    workingDir: /home/jenkins/agent
    image: gcr.io/kaniko-project/executor:debug
    imagePullPolicy: Always
    resources:
      requests:
        cpu: "1000m"
        memory: "1024Mi"
        ephemeral-storage: "5Gi"
      limits:
        cpu: "1000m"
        memory: "2048Mi"
        ephemeral-storage: "5Gi"
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
    - name: jenkins-docker-cfg
      mountPath: /kaniko/.docker
  - name: crane
    workingDir: /tmp/jenkins
    image: gcr.io/go-containerregistry/crane:debug
    imagePullPolicy: Always
    command:
    - /busybox/cat
    tty: true
  volumes:
  - name: jenkins-docker-cfg
    projected:
      sources:
      - secret:
          name: rencibuild-imagepull-secret
          items:
            - key: .dockerconfigjson
              path: config.json
'''
        }
    }
    environment {
        PATH = "/busybox:/kaniko:/ko-app/:$PATH"
        DOCKERHUB_CREDS = credentials("${env.REGISTRY_CREDS_ID_STR}")
        REGISTRY = "${env.DOCKER_REGISTRY}"
        REG_OWNER="helxplatform"
        REG_APP="helx-ui"
        COMMIT_HASH="${sh(script:"git rev-parse --short HEAD", returnStdout: true).trim()}"
        VERSION_FILE="./package.json"
        VERSION_TMP="${sh(script{"sed \'3q;d\' package.json | awk \'{ print $2 }\'"}, returnStdout: true).trim()}"
        VERSION="${sh(script{"echo $VERSION_TMP | tr -d \'\042\054\'"}, returnStdout: true).trim()}"
        IMAGE_NAME="${REG_OWNER}/${REG_APP}"
        TAG1="$BRANCH_NAME"
        TAG2="$COMMIT_HASH"
        TAG3="$VERSION"
    }
    stages {
        stage('Test') {
            steps {
                sh '''
                echo "Stage test"
                '''
            }
        }
        stage('Build') {
            steps {
                container(name: 'kaniko', shell: '/busybox/sh') {
                    sh '''#!/busybox/sh
                        echo "Stage build"
                        /kaniko/executor --dockerfile ./Dockerfile \
                                         --context . \
                                         --verbosity debug \
                                         --no-push \
                                         --destination $IMAGE_NAME:$TAG1 \
                                         --destination $IMAGE_NAME:$TAG2 \
                                         --tarPath image.tar
                        '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'image.tar', onlyIfSuccessful: true
                }
            }
        }
        stage('Publish') {
            steps {
                container(name: 'crane', shell: '/busybox/sh') {
                    sh '''
                    echo "Publish stage"
                    echo "$DOCKERHUB_CREDS_PSW" | crane auth login -u $DOCKERHUB_CREDS_USR --password-stdin $REGISTRY
                    crane push image.tar $IMAGE_NAME:$TAG1
                    crane push image.tar $IMAGE_NAME:$TAG2
                    '''
                }
            }
            post {
                cleanup {
                    sh '''
                    echo "Remove archived artifacts."
                    '''
                }
            }
        }
    }
}
