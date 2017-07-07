angular.module('app.controllers', [])

.controller('BehiveTrackerCtrl', function($scope,ionicTimePicker,ionicDatePicker, $rootScope, MainService, $ionicLoading, $ionicPopup, $timeout) {
    $scope.beehive = {
        teamName:"",
        siteName:"",
        qrCode:"",
        numberOfHives:0,
        populationOfBees:0,
        weakHives:0,
        strongHives:0,
        deadouts:0,
        hivesStrength:5,
        totalNumberOfSupers:0,
        varroaIn:false,
        varroaInDate:"",
        feedSs:false,
        feedSsDate:"",
        daysSinceLast2FeedsSs1:0,
        daysSinceLast2FeedsSs2:0,
        feedPp:false,
        feedPpDate:"",
        daysSinceLast2FeedsPp1:0,
        daysSinceLast2FeedsPp2:0,
        daysSinceVisited:0,
        gearNeeded:"",
        comments:"",
        submittedDate:""
    }
    $rootScope.beehiveKeys = angular.copy($scope.beehive);
    $scope.teamSites = [];
    $scope.teamSitesSelect = {teams:[],sites:[]};
    
    $scope.persons = [];
    $scope.personsSelect = [];
    
    $scope.blankBehive = angular.copy($scope.beehive);
    
    $scope.lastBeehive = {};
    MainService.getTeamSites().then(function(data){
        $scope.teamSites = data;
        for (var index in $scope.teamSites){
            var teamSite = $scope.teamSites[index];
            /*
            if ($scope.teamSitesSelect.teams.indexOf(teamSite["team"]) < 0){
                $scope.teamSitesSelect.teams.push(teamSite["team"]);
            }
            */
            if ($scope.teamSitesSelect.sites.indexOf(teamSite["site"]) < 0){
                $scope.teamSitesSelect.sites.push(teamSite["site"]);
            }        
            
        }
        MainService.getPersons().then(function(data2){
            $scope.persons = data2;
            for (var index in $scope.persons){
                $scope.personsSelect.push($scope.persons[index].person);
            }
        })
    });
    
    $scope.openScanQrCode = function(){
        if (cordova.plugins && cordova.plugins.barcodeScanner){
            cordova.plugins.barcodeScanner.scan(
                  function (result) {
                        if ($scope.checkQrCode(result.text)){
                            $scope.beehive.qrCode = result.text;
                            $ionicPopup.alert({
                            title: 'Success',
                            template: "Your location has been confirmed. You may now submit this data.",
                            buttons:[
                                {text: "OK",
                                type:"button-energized"}
                            ]
                            });                             
                        }
                        else{
                            $ionicPopup.alert({
                            title: 'Error',
                            template: "QR code is invalid. Please try again.",
                            buttons:[
                                {text: "OK",
                                type:"button-energized"}
                            ]
                            });                             
                        }
                  }, 
                  function (error) {
                    $ionicPopup.alert({
                    title: 'Error',
                    template: "Scanning failed with error: " + error,
                    buttons:[
                        {text: "OK",
                        type:"button-energized"}
                    ]
                    }); 
                  },
                  {
                      "preferFrontCamera" : false, // iOS and Android
                      "showFlipCameraButton" : true, // iOS and Android
                      "prompt" : "Place QR code inside the scan area", // supported on Android only
                      "formats" : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                  }
               );          
        }
    }
    
    
    $scope.checkQrCode = function(qrCode){
        for (var index in $scope.teamSites){
            var teamSite = $scope.teamSites[index];
            if (/*teamSite.team === $scope.beehive.teamName && teamSite.site === $scope.beehive.siteName*/ teamSite.qrCode === qrCode){
                $scope.beehive.teamName = teamSite.team;
                $scope.beehive.siteName = teamSite.site;
                $scope.selectOption();
                return teamSite.qrCode === qrCode;
            }
        }
        return false;
    }
    
    $scope.addAmount = function(amount,object, key){
        object[key] +=amount;
        if (object[key] < 0){object[key] = 0;}
    }
    
    $scope.setFieldDate = function(set, object,key){
        if (set){
            var date = new Date();
            var ampm = date.getUTCHours() < 12 ? "am" : "pm";
            var min = date.getUTCMinutes() < 10 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
            object[key] = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getUTCHours() + ":" + min + " " + ampm; 
        }
        else{
            object[key] = null;
        }
    }
    
    $scope.selectOption = function(){
        MainService.getLastBeehiveEntries($scope.beehive.teamName, $scope.beehive.siteName).then(function(data){

            //3 object: 1 last beehive, 2 last Pp beehive, 3 last Ss beehive
            var lastBeehive = data.lastBeehive;
            var lastPpBeehive = data.lastPpBeehive;
            var lastSsBeehive = data.lastSsBeehive;
            
            if (lastBeehive.numberOfHives){
                $scope.beehive.numberOfHives = parseInt(lastBeehive.numberOfHives); 
                $scope.beehive.populationOfBees = parseInt(lastBeehive.populationOfBees); 
                //$scope.beehive.hivesWithDoubleBrood = parseInt(lastBeehive.hivesWithDoubleBrood); 
                $scope.beehive.weakHives = parseInt(lastBeehive.weakHives); 
                //$scope.beehive.broodTaken = parseInt(lastBeehive.broodTaken); 
                //$scope.beehive.hivesWith1Super = parseInt(lastBeehive.hivesWith1Super); 
                //$scope.beehive.hivesWith2Supers = parseInt(lastBeehive.hivesWith2Supers); 
                //$scope.beehive.hivesWith3Supers = parseInt(lastBeehive.hivesWith3Supers); 
                //$scope.beehive.hivesWith4Supers = parseInt(lastBeehive.hivesWith4Supers); 
                var dateTimeParts = lastBeehive.submittedDate.split(" ");
                var dateParts = dateTimeParts[0].split("/");                
                $scope.beehive.daysSinceVisited = $scope.getDaysSince(new Date(dateParts[1] + "-" + dateParts[0] + "-" + dateParts[2]));
            }
            if (lastPpBeehive.feedPpDate){
                var dateTimeParts = lastPpBeehive.feedPpDate.split(" ");
                var dateParts = dateTimeParts[0].split("/");
                $scope.beehive.daysSinceLast2FeedsPp1 = $scope.getDaysSince(new Date(dateParts[1] + "-" + dateParts[0] + "-" + dateParts[2])); 
                $scope.beehive.daysSinceLast2FeedsPp2 = parseInt($scope.beehive.daysSinceLast2FeedsPp1) + parseInt(lastPpBeehive.daysSinceLast2FeedsPp1);   
            }
            if (lastPpBeehive.feedSsDate){
                var dateTimeParts = lastSsBeehive.feedSsDate.split(" ");
                var dateParts = dateTimeParts[0].split("/");                
                $scope.beehive.daysSinceLast2FeedsSs1 = $scope.getDaysSince(new Date(dateParts[1] + "-" + dateParts[0] + "-" + dateParts[2])); 
                $scope.beehive.daysSinceLast2FeedsSs2 = parseInt($scope.beehive.daysSinceLast2FeedsSs1) + parseInt(lastSsBeehive.daysSinceLast2FeedsSs1); 
            }
            
        },function(){
            $scope.beehive.numberOfHives = 0;  
            $scope.beehive.daysSinceVisited = 0
            $scope.beehive.daysSinceLast2FeedsPp1 = 0;
            $scope.beehive.daysSinceLast2FeedsPp2 = 0;
            $scope.beehive.daysSinceLast2FeedsSs1 = 0;
            $scope.beehive.daysSinceLast2FeedsSs2 = 0;
        })
    }
    
    $scope.$watch('beehive', function() {
        //$scope.beehive.totalNumberOfSupers = $scope.beehive.hivesWith1Super + ($scope.beehive.hivesWith2Supers*2) + ($scope.beehive.hivesWith3Supers*3) + ($scope.beehive.hivesWith4Supers*4);

    }, true);
    
    $scope.getDaysSince = function(date){
        var seconds = Math.floor((new Date() - date) / 1000);
        return Math.floor(seconds / 86400);
    }

    
    $scope.errorHandler = function(e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      };
      console.log(msg);
    }
    

    $scope.onInitFs = function(fs) {
        //console.log(cordova.file.externalDataDirectory + 'log.txt');

        var date = (new Date).getTime();
        $scope.beehive.filename = "behive" + date + ".txt";
        console.log($scope.beehive.filename);
        fs.root.getFile("behive" + date + ".txt", {create: true}, function(fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                  console.log('Write completed.');
                };

                fileWriter.onerror = function(e) {
                  console.log('Write failed: ' + e.toString());
                };

                // Create a new Blob and write it to log.txt.
                var blob = new Blob([JSON.stringify($scope.beehive)], {type: 'text/plain'});

                fileWriter.write(blob);

            }, $scope.errorHandler);

        }, $scope.errorHandler);

    }

        


    $scope.submitBeehive = function(){
        var teamSite = {};
        for (var index in $scope.teamSites){
            if ($scope.teamSites[index].site === $scope.beehive.siteName){
                teamSite = $scope.teamSites[index];
            }
        }   
        if (teamSite.qrCode !== $scope.beehive.qrCode){
            $ionicPopup.alert({
            title: 'Error',
            template: "Scan the site QR code to submit this data",
            buttons:[
                {text: "OK",
                type:"button-energized"}
            ]
            });  
            return;
        }
        $ionicLoading.show({
            template: 'Submitting data...'
        });      

        $scope.setFieldDate(true, $scope.beehive, "submittedDate");
        if (window.requestFileSystem || window.webkitRequestFileSystem){
            window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
            window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
              window.requestFileSystem(window.PERSISTENT, grantedBytes, $scope.onInitFs, $scope.errorHandler);
            }, function(e) {
              console.log('Error', e);
            });
        }
        
        
        MainService.submitBeehive($scope.beehive).then(function(){
            $scope.beehive = angular.copy($scope.blankBehive);
            $ionicLoading.hide();
            //connected to internet
            $ionicPopup.alert({
            title: 'Success',
            template: "Data submitted!",
            buttons:[
                {text: "OK",
                type:"button-energized"}
            ]            
            });       
        },function(){
            $scope.beehive = angular.copy($scope.blankBehive);
            $ionicLoading.hide();
            //not connected to internet
            $ionicPopup.alert({
            title: 'Error',
            template: "You are not currently connected to the internet. Your data has been queued to sync when you have an internet connection.",
            buttons:[
                {text: "OK",
                type:"button-energized"}
            ]            
            });              
        })
    }
    
    
    
    
    
    
    
    
    
})

.controller('HistoryCtrl', function($scope, MainService, $ionicPopup) {
    $scope.beehives = [];
    $scope.nsBeehives = [];
  $scope.$on('$ionicView.enter', function(){
       MainService.getBeehives().then(function(data){
          $scope.beehives = data;
      });
      $scope.nsBeehives = MainService.getNotSubmittedBeehives();
  })
  
  $scope.doSync = function(){
        $ionicPopup.alert({
        title: 'Sync started',
        template: "Syncing will complete in the background.",
        buttons:[
            {text: "OK",
            type:"button-energized"}
        ]        
        });       
      MainService.syncBeehives();
  }
})

.controller('HistoryDetailCtrl', function($scope, $stateParams, MainService, $rootScope) {
  $scope.beehive = MainService.getBeehive($stateParams.historyId, $stateParams.notSubmitted);
  
  
});
