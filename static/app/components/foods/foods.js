angular
    .module("App")
    .component('foods', {
        bindings: {
            foodList: '<'
        },
        templateUrl: 'app/components/foods/foods.html',
        controller: FoodsCtrl,
        controllerAs: "foodComp",
    });


function FoodsCtrl($window, $http, $interval, Auth, Log, DeleteFood) {

    var foodComp = this;

    var today = moment().format('MMMM Do YYYY');
    foodComp.currentCals = 0;
    foodComp.searchTerm = undefined;
    foodComp.chosenFoods = [];
    foodComp.chosenFoodMeasures = [];
    foodComp.soloFoodSearch = true;
    var deleteId = {
        user_id: Auth.currentUser().id,
        _id: null
        }

    var log = {
        user_id: Auth.currentUser().id,
        logs: {
            date: today,
            foods: []
        }
    };
    foodComp.mealList = log.logs;
    foodComp.measureQty = 1;
    foodComp.savedMeals = [];
    foodComp.savedMealDate = "";


    //Delay search for 1 second after done typing
    var interval = 1000;
    foodComp.delayBeforeSearch = function() {
        $interval.cancel(interval);
        interval = $interval(function() {
            foodComp.findFoods();
            $interval.cancel(interval);
        }, 1000);
    };


    // Return list of available foods based on search term
    foodComp.findFoods = function() {
        if (foodComp.searchTerm !== undefined && foodComp.searchTerm !== "") {
            var req = {
                url: 'api/foods/foodresults?searchTerm=' + foodComp.searchTerm,
                method: 'GET'
            };

            $http(req).then(function success(res) {
                if (res.data.list === undefined) {
                    foodComp.searchResults = null;
                } else {
                    foodComp.searchResults = res.data.list.item;
                }
            }, function failure(res) {
                console.log('failed');
            });
        } else {
            foodComp.searchResults = undefined;
        }
        return foodComp.searchResults;
    };


    // Select one of the foods from the search results to retrieve calorie info
    foodComp.chooseFood = function($event) {

        foodComp.searchResults = [];
        foodComp.searchTerm = "";

        var foodID = event.target.id;
        var req = {
            url: 'api/foods/addfood?foodId=' + foodID,
            method: 'GET'
        };

        $http(req).then(function success(res) {
            foodComp.chosen = res.data.report;
            console.log(foodComp.chosen);
            foodComp.chosenFoods.push({
                name: foodComp.chosen.food.name,
                kCals: foodComp.chosen.food.nutrients[1].value
            });

            var nutrients = foodComp.chosen.food.nutrients;
            for (var i = 0; i < nutrients.length; i++) {
                if (nutrients[i].name == "Energy") {
                    foodComp.chosenFoodMeasures = foodComp.chosen.food.nutrients[i].measures;
                }
            }

            foodComp.chosenFoodName = foodComp.chosen.food.name;

        }, function failure(res) {
            console.log('failed');
        });
    };


    // Add food to meal and reset search
    foodComp.addFood = function($event) {
        var qtyCals = parseInt(event.target.id);
        foodComp.mealList.foods.push({
            name: foodComp.chosenFoodName,
            kcals: qtyCals
        });
        foodComp.chosenFoodName = "";
        foodComp.chosenFoods = [];
        document.querySelector('#currentChosenFood').remove();
        foodComp.searchTerm = undefined;
    };


    // Save food to your daily log
    foodComp.saveFood = function() {

        // Get timestamp
        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes();


        foodComp.savedMeals.push(foodComp.mealList);
        console.log(foodComp.savedMeals);

        console.log('trying to send ', log);
        Log.update(log, function success(data){
            $window.location.reload();
            console.log('success res', data);
        }, function error(data){
            console.log('error', data);
        });


        foodComp.chosenFoods = [];
    };


    // Exit food quantity options
    foodComp.remove = function() {
        document.querySelector('#currentChosenFood').remove();
        foodComp.chosenFoods.pop();
    };


    // Remove food from meal
    foodComp.removeChosenFood = function() {
        document.querySelector('#savedFood').remove();
        foodComp.mealList.foods.pop();
    };

    //Delete activity from current user log
    foodComp.deleteFood = function($index) {
      deleteId._id = foodComp.foodList[$index]._id;
      deleteId.user_id = Auth.currentUser().id;
      console.log("Delete id: ", deleteId);
      DeleteFood.delete(deleteId).then(function(res) {
        $window.location.reload();
      }, function error(data) {
        console.log(data);
      });
    };

}

FoodsCtrl.$inject = ['$window','$http', '$interval', 'Auth', 'Log', 'DeleteFood'];
