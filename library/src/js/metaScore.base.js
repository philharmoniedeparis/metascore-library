/*global metaScore console*/


/**
* Defines the Class object
*/

(function(metaScore){  
	//Helper method for creating an super copied object clone
	function initialize(method){
		//Recursivly execute parent methods.
		if(method.parent instanceof Function){
			initialize.apply(this,[method.parent]);
      
			this.super = cloneCopy(this,
				superCopy(this,this.constructor)
			);
		}
		method.apply(this, arguments);
	}

	//Helper method which allows for super referances.
	function cloneCopy(from, to){
		for(var x in from){
			if(x !== "super" && from[x] instanceof Function){
				//Never create circular super referances.
				to[x] = from[x].super || superCopy(from, from[x]);
			}
		}
		return to;
	}

	function superCopy(scope, method){
		var scopeSuper = scope.super;
    
		return method.super = function(){
			scope.super = scopeSuper;
			return method.apply(scope, arguments);
		};
	}

	//Create Class object
	metaScore.Base = function(){};
	metaScore.Base.extend = function ext(to){
		function child(){
			//Prevent the prototype scope set executing the constructor.
			if(initialize !== arguments[0]){
				//Create inhereted object
				initialize.apply(this,[to]);
				//Setup scope for class instance method calls
				cloneCopy(this,this);
				if(this.initializer instanceof Function){
					this.initializer.apply(this);
        }
				this.constructor.apply(this,arguments);
			}
		}

		//Set prototype and constructor enabeling propper type checking.
		child.prototype = new this(initialize);
		child.prototype.constructor = child;

		//Return expected result from toString
		child.toString = function(){
			return to.toString();
		};

		//Allow the child to be extended.
		child.extend = function(target){
			//Create parent referance and inherentence path.
			target.parent = to;
			return ext.apply(child,arguments);
		};

		return child;
	};
  
	//Bootstrap Class by inheriting itself with empty constructor.
  metaScore.Base = metaScore.Base.extend(function() {
    this.constructor = function(){};
    
    this.initConfig = function(configs){
      configs = configs || {};
    
      if(this.defaults){
        this.configs = metaScore.Object.extend({}, this.defaults, configs);
      }
      else{
        this.configs = configs;
      }
    };
  });
    
})(metaScore);