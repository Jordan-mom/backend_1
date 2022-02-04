node{
	
  def registryProjet='registry.gitlab.com/jordanmom/test'
  def IMAGE="${registryProjet}:backend-${env.BUILD_ID}"

    stage('Clone') {
        checkout scm
    }
	
    def img = stage('Build') {
          docker.build("$IMAGE",  '.')
    }

    stage('Run') {
            img.withRun("--name run-$BUILD_ID -p 5252:5252") { c ->
            sh 'docker ps'
          }
    }

    stage('Push') {
          docker.withRegistry('https://registry.gitlab.com', 'reg1') {
              img.push 'latest'
              img.push()
          }
    }

    stage('Deploy - End') {
      ansiblePlaybook (
          colorized: true,
          become: true,
          playbook: 'playbook.yml',
          inventory: '${HOST},',
          extras: "--extra-vars 'image=$IMAGE'"
      )
    }
}
