/* YUI 3.9.1 (build 5852) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add("datatype-xml-parse",function(e,t){var n=e.Lang;e.mix(e.namespace("XML"),{parse:function(e){var t=null;if(n.isString(e))try{n.isUndefined(ActiveXObject)||(t=new ActiveXObject("Microsoft.XMLDOM"),t.async=!1,t.loadXML(e))}catch(r){try{n.isUndefined(DOMParser)||(t=(new DOMParser).parseFromString(e,"text/xml")),n.isUndefined(Windows.Data.Xml.Dom)||(t=new Windows.Data.Xml.Dom.XmlDocument,t.loadXml(e))}catch(i){}}return n.isNull(t)||n.isNull(t.documentElement)||t.documentElement.nodeName==="parsererror",t}}),e.namespace("Parsers").xml=e.XML.parse,e.namespace("DataType"),e.DataType.XML=e.XML},"3.9.1");
