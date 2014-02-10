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
    s.inline = 'sudo apt-get install -y git-core libfontconfig1 && sudo npm install -g grunt-cli && cd /vagrant/ && npm install && cd patterns && npm install'
  end
end
