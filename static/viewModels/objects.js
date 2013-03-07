	var Task=function(){
		var self = this;
		this.id=0;
		this.title=ko.observable('knockout js');
		this.owner=ko.observable('Amr');
		this.description=ko.observable('create a separate template of knockout js using a template block');
		this.dueOn=ko.observable('07.03.2013');
	};