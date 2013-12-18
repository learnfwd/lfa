Vagrant.configure("2") do |config|
  config.vm.box = "precise32"
  
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"
  
  config.vm.network "forwarded_port", guest: 1111, host: 1111
  
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
    s.inline = 'echo "cd /vagrant" >> /home/vagrant/.bashrc; cd /vagrant/; npm install -g'
  end
end
