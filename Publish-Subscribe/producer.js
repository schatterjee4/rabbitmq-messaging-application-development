require('../setup').Init('Publish Subscribe Producer.');
var order = require('../Shop/order');
var orderService = require('./orderService');
var connect = require('amqp').createConnection();
var orderId = 0;

connect.on('ready', function() {
    var ex = connect.exchange('shop.exchange', {type: 'direct', confirm:true});
    var q = connect.queue('shop.queue', {durable:true, autoDelete:false});
    q.on('queueDeclareOk', function(args) {
        q.bind('shop.exchange', 'order.key');
        q.on('queueBindOk', function() {
            console.log("Place your order");
            setInterval(function(){
                var newOrder = new order(++orderId);
                var service = new orderService(newOrder);
                service.ProcessOrder();
                publish = ex.publish('order.key', JSON.stringify(newOrder), {deliveryMode:2}, function(isError){
                    if (isError)
                        console.log('ERROR, Order has not been acknowledged. ' + args);
                });
            }, 1000);
        });
    });
});