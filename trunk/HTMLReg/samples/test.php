<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>PHP HTMLReg test</title>
<script type="text/javascript" src="http://htmlreg.googlecode.com/svn/trunk/HTMLReg/HTMLReg.js"></script>
<script type="text/javascript" src="http://cssreg.googlecode.com/svn/trunk/CSSReg/CSSReg.js"></script>
<?php 
$htmlData = rawurlencode('<img src=http://code.google.com/p/htmlreg/logo?logo_id=1273321303><script>alert(1)</script><table><tr><td>hello');
?>
<script>
window.onload = function() {
	HTMLReg.setAppID('helloWorldApplication');
	var safeHTML = HTMLReg.parse(decodeURIComponent('<?php echo $htmlData?>'));	
	document.getElementById('preview').innerHTML = safeHTML;
	document.getElementById('source').value = safeHTML;
	document.getElementById('original').value = decodeURIComponent('<?php echo $htmlData?>');			
}
</script>
</head>
<body>

<h1>Hello world HTMLReg</h1>

Preview HTML:<br />
<div id="preview">
</div>
<br />
Original source code:<br />
<textarea id="original" style="width:500px;height:300px;">
</textarea>
<br />
Safe HTML source code:<br />
<textarea id="source" style="width:500px;height:300px;">
</textarea>

</body>
</html>