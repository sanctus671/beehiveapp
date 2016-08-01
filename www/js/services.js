angular.module('app.services', [])


.service('MainService', function ($http, $q, API_URL,$interval){
    var MainService = this;
    this.submitBeehive = function(beehive){
        //MainService.saveBeehive(beehive);
        var deferred = $q.defer();  
        angular.extend(beehive, {method:"createbeehive"});
        $http.post(API_URL, beehive)    
            .success(function(data) {
                if (data.result === "success"){
                    deferred.resolve(data);
                }
                else{
                    MainService.saveNotSubmittedBeehive(beehive);
                    deferred.reject(data);
                }
            })
            .error(function(data,status) {
                MainService.saveNotSubmittedBeehive(beehive);
                deferred.reject(data);
            });

        return deferred.promise;  
    }
    
   this.submitNsBeehive = function(beehive,index){
        var deferred = $q.defer();  
        angular.extend(beehive, {method:"createbeehive"});
        $http.post(API_URL, beehive)    
            .success(function(data) {
                if (data.result === "success"){
                    MainService.removeNsBeehive(index)
                    deferred.resolve(data);
                }
                else{
                    deferred.reject(data);
                }
            })
            .error(function(data,status) {
                deferred.reject(data);
            });

        return deferred.promise;  
    }    
    
    this.removeNsBeehive = function(id){
        var beehives = MainService.getNotSubmittedBeehives();
        for (var index in beehives){
            if (index === id){
                beehives.splice(index, 1);
                break;
            }
        }
        this.saveNotSubmittedBeehives(beehives);
    }
    
    this.saveNotSubmittedBeehives = function(beehives){
        window.localStorage.nsbeehives = JSON.stringify(beehives);
    }
    
    this.syncBeehives = function(){
        var beehives = MainService.getNotSubmittedBeehives();
        console.log(beehives);
        if (beehives){
            var toSubmit = beehives.length;
            var interval = $interval(function(){
                console.log(toSubmit);
                if (toSubmit < 1){
                    MainService.removeNotSubmittedBeehives();
                    $interval.cancel(interval);
                }
                else{
                    MainService.submitNsBeehive(beehives[toSubmit - 1], toSubmit - 1)
                    toSubmit = toSubmit - 1;
                }
                
            },1000)
        }        
    }

    
    this.saveBeehive = function(beehive){
        var beehives = MainService.getBeehives();
        console.log(beehives);
        if (beehives){
            beehives.push(beehive);
            window.localStorage.beehives = JSON.stringify(beehives);
        }
        else{
            window.localStorage.beehives = JSON.stringify([beehive]);
        }
    };

    this.getBeehives = function(){
        var deferred = $q.defer();  
        $http.post(API_URL, {method:"getbeehives"})    
            .success(function(data) {
                if (data.result === "success"){
                    window.localStorage.beehives = JSON.stringify(data.data);
                    deferred.resolve(data.data);
                }
                else{
                    var offlineData = window.localStorage.beehives ? JSON.parse(window.localStorage.beehives) : null;
                    deferred.resolve(offlineData);
                }
            })
            .error(function(data,status) {
                var offlineData = window.localStorage.beehives ? JSON.parse(window.localStorage.beehives) : null;
                deferred.resolve(offlineData);
            });

        return deferred.promise;         

    }; 
    
    
    this.getBeehive = function(index, notSubmitted){
        var data = window.localStorage.beehives ? JSON.parse(window.localStorage.beehives) : null;
        if (notSubmitted){
            var data = window.localStorage.nsbeehives ? JSON.parse(window.localStorage.nsbeehives) : null;   
        }
        if (data){
            return data[index];
        }
        return data;
    }; 
    
    this.getTeamSites = function(){
        var deferred = $q.defer();  
        $http.post(API_URL, {method:"getteamsites"})    
            .success(function(data) {
                if (data.result === "success"){
                    window.localStorage.teamsites = JSON.stringify(data.data);
                    deferred.resolve(data.data);
                }
                else{
                    var offlineData = window.localStorage.teamsites ? JSON.parse(window.localStorage.teamsites) : null;
                    deferred.resolve(offlineData);
                }
            })
            .error(function(data,status) {
                var offlineData = window.localStorage.teamsites ? JSON.parse(window.localStorage.teamsites) : null;
                deferred.resolve(offlineData);
            });

        return deferred.promise;         
    }
    this.getLastBeehiveEntries = function(teamName,siteName){
        var deferred = $q.defer();

        
        MainService.getBeehives().then(function(data){
            if (data.length < 1){
                deferred.reject();
            }
            var lastBeehives = {
                lastBeehive:{},
                lastPpBeehive:{},
                lastSsBeehive:{}
            }            
            for (var index in data){
                var beehive = data[index];
                if (/*beehive.teamName === teamName &&*/ beehive.siteName === siteName){
                    lastBeehives.lastBeehive = beehive;
                    if (parseInt(beehive.feedPp)){
                        lastBeehives.lastPpBeehive = beehive;
                    }
                    if (parseInt(beehive.feedSs)){
                        lastBeehives.lastSsBeehive = beehive;
                    }
                }
                
            } 
            deferred.resolve(lastBeehives);
        },function(){
            deferred.reject();
        });
        
        return deferred.promise; 

    }    
    
    this.getPersons = function(){
        var deferred = $q.defer();  
        $http.post(API_URL, {method:"getpersons"})    
            .success(function(data) {
                if (data.result === "success"){
                    window.localStorage.persons = JSON.stringify(data.data);
                    deferred.resolve(data.data);
                }
                else{
                    var offlineData = window.localStorage.persons ? JSON.parse(window.localStorage.persons) : null;
                    deferred.resolve(offlineData);
                }
            })
            .error(function(data,status) {
                var offlineData = window.localStorage.persons ? JSON.parse(window.localStorage.persons) : null;
                deferred.resolve(offlineData);
            });

        return deferred.promise;         
    }    
    
    this.saveNotSubmittedBeehive = function(beehive){
        var beehives = MainService.getNotSubmittedBeehives();
        if (beehives){
            beehives.push(beehive);
            window.localStorage.nsbeehives = JSON.stringify(beehives);
        }
        else{
            window.localStorage.nsbeehives = JSON.stringify([beehive]);
        }
    };

    this.getNotSubmittedBeehives = function(){
        var data = window.localStorage.nsbeehives ? JSON.parse(window.localStorage.nsbeehives) : null;
        return data;
    };
    
    this.removeNotSubmittedBeehives = function(){
        window.localStorage.nsbeehives = null;
    }    
   
    
});

