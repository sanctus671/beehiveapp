angular.module('app.controllers', [])

.controller('BehiveTrackerCtrl', function($scope,ionicTimePicker,ionicDatePicker, MainService, $ionicLoading, $ionicPopup, $timeout) {
    $scope.beehive = {
        teamName:"",
        siteName:"",
        qrCode:"",
        numberOfHives:0,
        populationOfBees:0,
        hivesWithDoubleBrood:0,
        weakHives:0,
        broodTaken:0,
        hivesWith1Super:0,
        hivesWith2Supers:0,
        hivesWith3Supers:0,
        hivesWith4Supers:0,
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
        submittedDate:"",
        submittedAt:""
    }
    
    $scope.blankBehive = angular.copy($scope.behive);
    
    $scope.addAmount = function(amount,object, key){
        console.log(object[key]);
        object[key] +=amount;
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
        $scope.checklist.filename = "checklist" + date + ".txt";
        console.log($scope.checklist.filename);
        fs.root.getFile("checklist" + date + ".txt", {create: true}, function(fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                  console.log('Write completed.');
                };

                fileWriter.onerror = function(e) {
                  console.log('Write failed: ' + e.toString());
                };

                // Create a new Blob and write it to log.txt.
                var blob = new Blob([JSON.stringify($scope.checklist)], {type: 'text/plain'});

                fileWriter.write(blob);

            }, $scope.errorHandler);

        }, $scope.errorHandler);

    }

        


    $scope.submitBeehive = function(){
        $ionicLoading.show({
            template: 'Submitting data...'
        });      
        
        var date = new Date();
        var ampm = date.getUTCHours() < 12 ? "am" : "pm";
        var min = date.getUTCMinutes() < 10 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
        $scope.behive.submittedDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        $scope.behive.submittedAt =  date.getUTCHours() + ":" + min + " " + ampm;   
        //window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
          window.requestFileSystem(window.PERSISTENT, grantedBytes, $scope.onInitFs, $scope.errorHandler);
        }, function(e) {
          console.log('Error', e);
        });
        
        
        MainService.submitBeehive($scope.beehive).then(function(){
            $scope.behive = angular.copy($scope.blankBehive);
            $ionicLoading.hide();
            //connected to internet
            $ionicPopup.alert({
            title: 'Success',
            template: "Data submitted!"
            });             
        },function(){
            $scope.behive = angular.copy($scope.blankBehive);
            $ionicLoading.hide();
            //not connected to internet
            $ionicPopup.alert({
            title: 'Error',
            template: "You are not currently connected to the internet. Your data has been queued to sync when you have an internet connection."
            });              
        })
    }
    
    
    
    
    
    
    
    
    
})

.controller('HistoryCtrl', function($scope, MainService, $ionicPopup) {
  $scope.$on('$ionicView.enter', function(){
      $scope.beehives = MainService.getBeehives();
  })
  
  $scope.doSync = function(){
        $ionicPopup.alert({
        title: 'Sync started',
        template: "Syncing will complete in the background."
        });       
      MainService.syncBeehives();
  }
})

.controller('HistoryDetailCtrl', function($scope, $stateParams, MainService) {
  $scope.beehive = MainService.getBeehive($stateParams.historyId);
  
});
