Vagrant.configure("2") do |config|
  config.vm.box = "precise32"
  
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"
  
  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "nodejs"
    chef.json = {
      "nodejs" => {
        "version" => "0.10.23"
      }
    }
    
    chef.add_recipe "build-essential"
  end
  
  
  config.vm.provision "shell" do |s|
    cmds = []
    
    cmds.push 'sudo apt-get install -y git-core libfontconfig1'
    
    cmds.push 'sudo -H npm install -g grunt-cli'
    
    cmds.push 'cd /vagrant/'
    cmds.push 'sudo -H -u vagrant bash -c "npm install"'
    
    cmds.push 'cd patterns'
    cmds.push 'sudo -H -u vagrant bash -c "npm install"'
    
    cmds.push '( sudo -H -u vagrant bash -c "echo \"cd /vagrant/\" >> ~/.profile" )'
    
    s.inline = cmds.join(' && ')
  end
end
