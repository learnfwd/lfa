Casper = require('casper').Casper
colorizer = require('colorizer').create('Colorizer')
casper = new Casper(clientScripts: ['spec/jquery.min.js'])

Casper.prototype.capture_resource = (name) ->
  console.log colorizer.colorize("  ✓", 'INFO') + " #{name}()"
  @captureSelector "spec/results/#{name}.png", ".#{name}"

Casper.prototype.headline = (name) ->
  @echo ''
  @echo '----------------------'
  @echo "#{name}", 'WARNING'
  @echo '----------------------'
  @echo ''

# initialize tests

casper.start 'http://localhost:3000', ->
  @test.assertHttpStatus 200, 'server is running'

# text
casper.then ->
  @headline 'text'
  @capture_resource 'h1'
  @capture_resource 'h2'
  @capture_resource 'h3'
  @capture_resource 'h4'
  @capture_resource 'h5'
  @capture_resource 'h6'
  
  @capture_resource 'text-left'
  @capture_resource 'text-center'
  @capture_resource 'text-right'
  @capture_resource 'text-justify'

  @capture_resource 'text-uppercase'
  @capture_resource 'text-lowercase'
  @capture_resource 'text-bold'
  @capture_resource 'text-italic'
  @capture_resource 'text-underline'

# forms
casper.then ->
  @headline 'forms'
  @capture_resource 'input'
  @capture_resource 'textarea'

# lists
casper.then ->
  @headline 'lists'
  @capture_resource 'li-normal'
  @capture_resource 'li-upper-latin'

# images
casper.then ->
  @headline 'images'
  @capture_resource 'parallax'

casper.then ->
  @echo ""

casper.run()