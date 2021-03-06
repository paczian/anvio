/**
 *  Session functions for anvi'o interactive interface
 *
 *  Author: Tobias Paczian <tobiaspaczian@googlemail.com>
 *  Copyright 2015, The anvio Project
 *
 * This file is part of anvi'o (<https://github.com/meren/anvio>).
 *
 * Anvi'o is a free software. You can redistribute this program
 * and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with anvi'o. If not, see <http://opensource.org/licenses/GPL-3.0>.
 *
 * @license GPL-3.0+ <http://opensource.org/licenses/GPL-3.0>
 */

// initialization functions
$(document).ready(function(){
    $('#password').on('keypress', function(e) { e=e||window.event;if(e.keyCode==13){performLogin();}});
    $("#uploadDataForm").submit(function(event){ event.preventDefault(); });
    $("#loginForm").submit(function(event){ event.preventDefault(); });
    checkCookie();
});

/* login */
function performLogin () {
    var formData = new FormData();
    if (! (document.getElementById('login').value && document.getElementById('password').value)) {
	alert('you must enter both password and login');
	return;
    }
    formData.append('login', document.getElementById('login').value);
    formData.append('password', document.getElementById('password').value);
    $.ajax({
    	url : '/login',
	processData: false,
	contentType: false,
	type : 'POST',
    	data : formData,
    	success : function(data) {
	    if (data[0]) {
		session = { "user": data[1],
			    "project": { "name": document.title } };
		setUserData();
		toastr.success('Welcome back '+session.user.firstname+' '+session.user.lastname, 'login successful', {timeOut: 5000})
	    } else {
		toastr.error(data[1], "login failed");
	    }
    	}
    });
}

function checkCookie () {
    var cookie = $.cookie('anvioSession');
    if (cookie) {
	var formData = new FormData();
	formData.append('token', cookie);
	$.ajax({
    	    url : '/token',
	    processData: false,
	    contentType: false,
	    type : 'POST',
    	    data : formData,
    	    success : function(data) {
		if (data[0]) {
		    session = { "user": data[1],
				"project": { "name": document.title } };
		    setUserData();
		}
    	    }
	});
    }
}

function setUserData () {
    document.getElementById('loginFormWrapper').style.display = 'none';
    var sw = document.getElementById('sessionWrapper');
    sw.style.display = '';

    // get all projects the user has access to
    var project_select = '<div class="btn-group" style="margin: 0px; height: 31px;"><button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 225px; text-align: left; height: 31px; overflow: hidden; text-overflow: ellipsis; whitespace: nowrap;" title="'+document.title+'"><span class="caret" style="margin-right: 4px;"></span> '+document.title+'</button><ul class="dropdown-menu">';
    if (session.hasOwnProperty('publicProjects')) {
	project_select += '<li class="disabled"><a>PUBLIC</a></li>';
	for (var i=0; i<session.publicProjects.length; i++) {
	    project_select += '<li><a href="#" onclick="setActiveProject(\''+session.publicProjects[i]+'\', true);">'+session.publicProjects[i]+'</a></li>';
	}
    }
    project_select += '<li class="disabled"><a>PRIVATE</a></li>';
    for (var i=0; i<session.user.project_names.length; i++) {
	project_select += '<li><a href="#" onclick="setActiveProject(\''+session.user.project_names[i]+'\');">'+session.user.project_names[i]+'</a></li>';
    }
    project_select += '</ul></div>';

    var html = '<div style="padding-top: 2px;">';
    html += '<button type="button" style="margin-right: 5px; float: right;" class="btn btn-danger btn-sm" title="log out" onclick="performLogout();"><span class="glyphicon glyphicon-white glyphicon-off" aria-hidden="true"></span></button>';
    html += '<img src="images/user.png" style="width: 32px; float: right; border-radius: 3px; margin-right: 5px;" title="logged in as '+session.user.firstname+' '+session.user.lastname+' ('+session.user.login+')">';
    html += '<button type="button" style="margin-right: 5px;" class="btn btn-default btn-sm" title="upload data files" onclick="$(\'#modUploadData\').modal(\'show\');"><span class="glyphicon glyphicon-floppy-open" aria-hidden="true"></span></button>';
    html += '<button type="button" style="margin-right: 5px;" class="btn btn-default btn-sm" title="project settings" onclick="$(\'#modProjectSettings\').modal(\'show\');"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></button>';
    html += '<button type="button" style="margin-right: 5px;" class="btn btn-default btn-sm" title="create public view" onclick="$(\'#modShareProject\').modal(\'show\');"><span class="glyphicon glyphicon-share" aria-hidden="true"></span></button>';
    html += '<button type="button" style="margin-right: 5px;" class="btn btn-default btn-sm" title="delete project" onclick="deleteProject()"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>';
    html += project_select;
    html += '</div>';
    sw.innerHTML = html;
}

function performLogout () {
    var formData = new FormData();
    formData.append('login', session.user.login);
    $.ajax({
    	url : '/logout',
	processData: false,
	contentType: false,
	type : 'POST',
    	data : formData,
    	success : function(data) {
	    document.location.reload(true);
	}
    });
    document.getElementById('loginFormWrapper').style.display = '';
    document.getElementById('sessionWrapper').style.display = 'none';
    session.user = {};
}

/* Project Management */
function setActiveProject(p, view, token) {
    if (view) {
	window.location(window.location.origin+'/project?name=p'+(token ? '&code='+token : ''));
    }
    if (p !== document.title) {
	$.removeCookie('anvioView', { path: '/' });
	var formData = new FormData();
	formData.append('project', p);
	$.ajax({
	    url : '/project',
	    type : 'POST',
	    data : formData,
	    processData: false,
	    contentType: false,
	    success : function(data) {
		document.location.reload(true);
	    }
	});
    }
}

function deleteProject() {
    if (confirm("Really delete this project? This cannot be undone!")) {
	var formData = new FormData();
	formData.append('project', document.title);
	$.ajax({
	    url : '/project',
	    type : 'DELETE',
	    data : formData,
	    processData: false,
	    contentType: false,
	    success : function(data) {
		document.location.reload(true);
	    }
	});
    }
}

function shareProject() {
    var name = document.getElementById('projectName').value;
    var isPublic = document.getElementById('projectPublic').checked;
    if (! name.match(/^\w+$/)) {
	aler('The project name may only contain word characters');
    } else {
	$('#modShareProject').modal('hide');
	session.project.view = name;
	session.project.isPublic = isPublic;
	var formData = new FormData();
	formData.append('name', name);
	formData.append('public', isPublic ? 1 : 0);
	$.ajax({
	    url : '/share',
	    type : 'POST',
	    data : formData,
	    processData: false,
	    contentType: false,
	    complete : function(jqXHR) {
		var data = JSON.parse(jqXHR.responseText);
		if (data.hasOwnProperty('ERROR')) {
		    toastr.error(data.ERROR, 'share project failed');
		} else {
		    var baseURL = window.location.origin + '/project?name='+session.project.view;
		    var code = session.project.isPublic ? '' : '&code='+data.token;
		    var msg = 'Your project has been shared.<br>It is now available via the following link:<br><br><a href="'+baseURL+code+'" target=_blank>'+baseURL+code+'</a>';
		    document.getElementById('projectSettingsContent').innerHTML = msg;
		    $('#modProjectSettings').modal('show');
		}
	    }
	});
    }
}

/* Data upload */
function uploadFiles () {
    var formData = new FormData();
    if ($('#treeFileSelect')[0].files.length) {
	formData.append('treeFile', $('#treeFileSelect')[0].files[0]);
    } else {
	alert('You must provide a tree file');
	return;
    }
    if ($('#fastaFileSelect')[0].files.length) {
	formData.append('fastaFile', $('#fastaFileSelect')[0].files[0]);
    }
    if ($('#dataFileSelect')[0].files.length) {
	formData.append('dataFile', $('#dataFileSelect')[0].files[0]);
    }
    if ($('#uploadTitle')[0].value) {
	formData.append('title', $('#uploadTitle')[0].value);
    }
    $('#modUploadData').modal('hide');
    
    uploadProgress = document.createElement('div');
    uploadProgress.setAttribute('style', 'position: absolute; right: 0px; width: 400px; bottom: 0px; border: 1px solid lightgray; border-bottom: none; height: 25px; background-color: white;');
    uploadProgress.innerHTML = '<div class="progress" style="margin: 5px; margin-bottom: 0px;">\
  <div id="uploadProgressBar" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;">\
    0%\
  </div>\
</div>';
    document.body.appendChild(uploadProgress);
    
    $.ajax({
	url : '/upload',
	xhr: function() {
	    var xhr = new window.XMLHttpRequest();
	    xhr.upload.addEventListener("progress", dataFileUploadProgress, false);
	    return xhr;
	},
	type : 'POST',
	data : formData,
	processData: false,
	contentType: false,
	success : function(data) {
	    document.body.removeChild(uploadProgress);
	    uploadProgress = null;
            document.location.reload(true);
	}
    });
}

function dataFileUploadProgress (event) {
    var curr = parseInt(event.loaded / event.total * 100);
    var p = document.getElementById('uploadProgressBar');
    p.setAttribute('aria-valuenow', curr);
    p.style.width = curr + "%";
    p.innerHTML = curr + "%";
}

function uploadFileSelected (which) {
    $('#'+which+'FileName')[0].value = $('#'+which+'FileSelect')[0].files[0].name || "";
}

!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)}(function(e){function n(e){return u.raw?e:encodeURIComponent(e)}function o(e){return u.raw?e:decodeURIComponent(e)}function i(e){return n(u.json?JSON.stringify(e):String(e))}function r(e){0===e.indexOf('"')&&(e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return e=decodeURIComponent(e.replace(c," ")),u.json?JSON.parse(e):e}catch(n){}}function t(n,o){var i=u.raw?n:r(n);return e.isFunction(o)?o(i):i}var c=/\+/g,u=e.cookie=function(r,c,a){if(void 0!==c&&!e.isFunction(c)){if(a=e.extend({},u.defaults,a),"number"==typeof a.expires){var d=a.expires,f=a.expires=new Date;f.setTime(+f+864e5*d)}return document.cookie=[n(r),"=",i(c),a.expires?"; expires="+a.expires.toUTCString():"",a.path?"; path="+a.path:"",a.domain?"; domain="+a.domain:"",a.secure?"; secure":""].join("")}for(var s=r?void 0:{},p=document.cookie?document.cookie.split("; "):[],m=0,v=p.length;v>m;m++){var x=p[m].split("="),k=o(x.shift()),l=x.join("=");if(r&&r===k){s=t(l,c);break}r||void 0===(l=t(l))||(s[k]=l)}return s};u.defaults={},e.removeCookie=function(n,o){return void 0===e.cookie(n)?!1:(e.cookie(n,"",e.extend({},o,{expires:-1})),!e.cookie(n))}});