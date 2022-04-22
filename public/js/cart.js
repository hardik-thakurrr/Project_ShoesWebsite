
var app = angular.module("myapp", []);
app.controller('mycontroller', function ($scope,$http) {
    

    $scope.inventory = [{
            id: 1,
            shoe_name: "Jordan why not zero.3 black cement",
            price: 7999,
            qty: 1,
            "href": "img/20.png"
        },
        {
            id: 2,
            shoe_name: "Nike Air Jordan 1 Retro University Blue",
            price: 12999,
            qty: 1,
            "href": "img/2.png"
        },
        {
            id: 3,
            shoe_name: "Nike jordan 36 PF white/black",
            price: 11999,
            qty: 1,
            "href": "img/3.png"
        },
        {
            id: 4,
            shoe_name: "Adidas Yeezy 500 High Slate black",
            price: 8999,
            qty: 1,
            "href": "img/12.png"
        },
        {
            id: 5,
            shoe_name: "Nike Dunk SB Low x Travis Scott",
            price: 15999,
            qty: 1,
            "href": "img/13.png"
        },
    ];

    $scope.products = [{
            id: 6,
            shoe_name: "Jordan Point Lane",
            price: 9999,
            qty: 1,
            "href": "img/4.png"
        },
        {
            id: 7,
            shoe_name: "Nike Jordan 1 Pine Green",
            price: 7999,
            qty: 1,
            "href": "img/5.png"
        },
        {
            id: 8,
            shoe_name: "Adidas Originals NMD R1 Core black",
            price: 6999,
            qty: 1,
            "href": "img/6.png"
        },
        {
            id: 9,
            shoe_name: "Nike Zoom freak 3",
            price: 8999,
            qty: 1,
            "href": "img/16.png"
        },
        {
            id: 10,
            shoe_name: "Puma Wide rider rollin Lace-up",
            price: 6999,
            qty: 1,
            "href": "img/10.png"
        },
        {
            id: 11,
            shoe_name: "Adidas Originals Forum Mid white/blue",
            price: 12999,
            qty: 1,
            "href": "img/17.png"
        },
        {
            id: 12,
            shoe_name: "Puma Butter Goods Basket Vintage",
            price: 5999,
            qty: 1,
            "href": "img/18.png"
        }, {
            id: 13,
            shoe_name: "Nike Cosmic unity game royal",
            price: 13999,
            qty: 1,
            "href": "img/19.png"
        },
        {
            id: 14,
            shoe_name: "Nike Waffle Trainer",
            price: 10999,
            qty: 1,
            "href": "img/21.png"
        }
    ];

    $scope.featured = [{
            id: 15,
            shoe_name: "Nike Air Max 270 react worldwide",
            price: 10999,
            qty: 1,
            "href": "img/7.png"
        },
        {
            id: 16,
            shoe_name: "Puma RS-X Core",
            price: 9999,
            qty: 1,
            "href": "img/11.png"
        },
        {
            id: 17,
            shoe_name: "Adidas Crazy BYW X 2.0",
            price: 12999,
            qty: 1,
            "href": "img/15.png"
        }
    ];


    $scope.cart = [];
    $scope.cart_products = [];

    

    var findItemById = function (items, id) {
        return _.find(items, function (item) {
            return item.id === id;
        });
    };

    var getItem=function(items) {
        return items;
    }
    $scope.getCost = function (item) {
        return item.qty * item.price;
    };

    $scope.getTotal = function () {
        var total = _.reduce($scope.cart, function (sum, item) {
            return sum + $scope.getCost(item);
        }, 0);
        console.info('Total: ' + total);
        
        return total;
    };

    $scope.addItem =  function (itemToAdd) {
        console.log(itemToAdd);
        var found = findItemById($scope.cart, itemToAdd.id);
        $http.post('/sendToSQL',JSON.stringify(itemToAdd)).then(function(res){
        })

        var [id,shoe_name,price,qty]=getItem($scope.cart);
        if (found) {
            found.qty += itemToAdd.qty;
           
        } else {
            $scope.cart.push(angular.copy(itemToAdd));
            //console.log($scope.cart)        
            
                        

        }
    };

    $scope.clearCart = function () {
        console.log("Cleared");
        $scope.cart.length = 0;
        console.log("Cleared");
    };

    $scope.removeItem = function (item) {
        var index = $scope.cart.indexOf(item);
        $scope.cart.splice(index, 1);
        $http.post('/sendToremove',JSON.stringify(item)).then(function(res){
            
            

        })



    };

    //FORM HIDING
    $scope.ok = false;

    $scope.activate = function () {
        $scope.ok = !$scope.ok;
    }

    

});
