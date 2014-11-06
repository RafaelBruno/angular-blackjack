$blackjack = angular.module('ngBlackjack',['ngSanitize'])
.controller('blackjackCtrl',["$scope","serviceBlackjack","$timeout",
	function($scope, serviceBlackjack,$timeout){
		var cardDeck = $('#deck').playingCards();
		cardDeck.spread();
		var removeByAttr = function(arr, attr, value){
			var i = arr.length;
			while(i--){
				if( arr[i] 
					&& arr[i].hasOwnProperty(attr) 
					&& (arguments.length > 2 && arr[i][attr] === value ) ){ 
					arr.splice(i,1);
			}
		}
		return arr;
	}
	removeByAttr(cardDeck.cards, 'rankString', 'Joker');

	serviceBlackjack.deck = cardDeck;
	$scope.myHand = [];
	$scope.dealerHand = [];
	$scope.hand = [new Object];
	$scope.dealer = [new Object];



	$scope.startGame = function(){
		$(".startNewGame").hide();
		$(".newGame").fadeIn();
	}

	$scope.youTurn = function(){
		if($scope.action !== "stop"){
			$("#youTurn").show()
		}else{
			$scope.dealerTurn("youStop");
		}
	}
	$scope.reload = function(){
		window.location.reload();
	}

	$scope.hit = function(action){
		if(action !== "stop"){
			$scope.hand.push(new Object);
			$("#youTurn").hide();
			$timeout(function() {
				var dealerPoints = $('.pointsDealer').find("span").text();
				var myPoints = $('.myPoints').find("span").text();
				//You don't automatically win for having 21
				//if(myPoints === 21){
				//	$("#youWin").modal("show");
				//}
				/*else*/ if(myPoints > 21){
					$("#youLose").modal("show");
				}else{
				    //Dealer doesn't go until you're finished hitting
					//$scope.dealerTurn();
					;
				}
			}, 100);
		}else{
			$("#youTurn").hide();
			$scope.action = "stop";
			$scope.dealerTurn("youStop");
		}
		if(myPoints === 21){
			$("#youWin").modal("show");
		}
	}

	$scope.dealerTurn = function(action){
		$timeout(function() {
			var dealerPoints = $('.pointsDealer').find("span").text();
			$("#dealerTurn").fadeIn();
			$(".dealerAction").hide();
			if(dealerPoints <= 17){
				$(".continue").show();
				$timeout(function() {
					$scope.dealer.push(new Object);
					$("#dealerTurn").hide();
					verifyDealer();
				}, 2000);
			}else{
				$(".stop").show();
				$timeout(function() {
					dealerStop();
				}, 800);
			}
		}, 400);
	}

	function verifyDealer(){
		$("#youTurn").hide()
		$("#dealerTurn").hide();
		$timeout(function() {
			var dealerPoints = $('.pointsDealer').find("span").text();
			console.log(dealerPoints)
			var myPoints = $('.myPoints').find("span").text();
			if(dealerPoints > 21){
				$("#youWin").modal("show");
				$scope.action === "win";
			}else if(dealerPoints === 21){
				$("#youLose").modal("show");
				$scope.action === "lose";
			}
			$scope.youTurn();
		}, 100);
	}

	function dealerStop(){
		$("#youTurn").hide();
		$("#dealerTurn").hide();
		$timeout(function() {
			var dealerPoints = $('.pointsDealer').find("span").text();
			var myPoints = $('.myPoints').find("span").text();
			if(dealerPoints < myPoints){
				$("#youWin").modal("show");
			}else if($scope.action === "stop"){
				if(dealerPoints > myPoints){
					$("#youLose").modal("show");
				}else if(dealerPoints === myPoints){
					$("#draw").modal("show");
				}else if(dealerPoints < myPoints){
					$("#youWin").modal("show");
				}else if(dealerPoints === myPoints){
					$("#draw").modal("show");
				}else{
					$scope.youTurn();
				}
			}
		}, 200);
	}



}]).directive('card', function(serviceBlackjack) {
	return {
		restrict: 'EA',
		scope: {
			'hand':"@",
		},
		template: '<div class="card"></div>',
		link: function(scope, el, attrs) {
			var cardDeck = serviceBlackjack.deck;
			var hand = [];
			var showHand = function(){
				el.html('');
				console.log()
				if(scope.hand === "you"){
					serviceBlackjack.hand.push(hand[0]);
					serviceBlackjack.getPoints('myPoints',serviceBlackjack.hand);
				}else{
					serviceBlackjack.dealer.push(hand[0]);
					serviceBlackjack.getPoints('pointsDealer',serviceBlackjack.dealer);
				}
				el.append(hand[0].getHTML());
				attrs.$set('valueCard',hand[0].rank);
			}
			var getCard = function(){
				var c = cardDeck.draw();
				if(!c){
					alert('no more cards');
					return;
				}
				hand[0] = c;
				cardDeck.spread();
				showHand();
			}
			getCard();
		}
	}
}).service('serviceBlackjack', function() {
	this.deck = {};
	this.hand = [];
	this.dealer = [];
	this.youPoints = 0;
	this.dealerPoints = 0;
	this.getPoints = function(scorePanel, thisHand){
		if(thisHand.length === 0){
			return 0;
		}else{
			var total = 0;
			var aces = 0;
			for(var i = 0; i < thisHand.length; i++){
				var valueCard = parseInt(thisHand[i].rank);
				if(thisHand[i].rank === "A"){
				    //Figure out aces last
					aces++;
				}
				else if(isNaN(valueCard)){
					total += 10; 
				}else{
					total += valueCard;
				}
			}
			//Aces have to count at least one point each
			total += aces;
			//The only time we'd want to count an ace as 11 is if we have less that 11 total without it
			if(total <= 11 && aces != 0)
			    total += 10;
			
			$('.'+scorePanel).find("span").html(total);
			if(total > 21){
				$('.'+scorePanel).removeClass("bg-primary").addClass("bg-danger");
			}else if(total == 21){
				$('.'+scorePanel).removeClass("bg-primary").addClass("bg-success");
			}else if(total >= 16 && total < 21){
				$('.'+scorePanel).removeClass("bg-primary").addClass("bg-warning");
			}
			return total;
		}
	};
});
