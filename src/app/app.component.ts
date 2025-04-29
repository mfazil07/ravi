<!--#include virtual="/common_include/efm_check_session.asp"-->
<!--#include file="include/efm_va_common.asp"-->

<%    
'********************************************************************************************************************************************
' File Created: Dinuka 02/29/2024 - TFS #443523 - Displays the document type drop-down to Import/ Append the files for the Diagnostics Tab
' Modified:     Dinuka 08/27/2024 - TFS #489279 - Included session validation
'********************************************************************************************************************************************
     DocStatus = request("docstatus")
     FilePath  = request("filepath")
     DefaultDocType  = request("doctype")
     AccountNumb     = request("accountnumber")
    
     Dim document_type_leng, doctype_row, code_column, display_column, alias_column, storedProcedureType
     Dim message, tempFile
     Dim filesArray(1)
     
    '********************************* Load Diagnostics Lookup Data *********************************
     document_type_leng = -1  
     doctype_row = 2
     code_column = 1
     display_column = 2
     alias_column = 0
     storedProcedureType = 4
     
     'Load dropdown data 
     Set cmd = server.CreateObject("ADODB.Command")
     With cmd
        .ActiveConnection = quadis_conn
        .Properties("PLSQLRSet") = TRUE
        .CommandType = storedProcedureType
        .CommandText = "QTC.EFM_PKG.GET_DIAGNOSTICS_DOCTYPES"	
     End with		
     Set doctype_rs = CreateObject("ADODB.Recordset")
     Set doctype_rs = cmd.Execute
     
     If ((doctype_rs.EOF = False) or (doctype_rs.BOF = False)) Then
        	document_type = doctype_rs.GetRows
        	document_type_leng = uBound(document_type)
     End If		
     doctype_rs.Close
    '********************************* END Load Diagnostics Lookup Data *********************************
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Diagnostics Document <%=Trim(DocStatus)%> (<%=Replace(AccountNumb, "_",".") %>)</title>
    <link rel="stylesheet" href="/common_assets/css/qcom.css" type="text/css">
    <link rel="stylesheet" href="/common_assets/css/qcom-efm.css" type="text/css">
    <script src="/common_assets/js/jquery-1.12.4.js"></script>
    <script src="js/qcom-va.js"></script>
<script src="Js/pdf.worker.min.js"></script>
<script src="Js/pdf.min.js"></script>
    <script src="js/qcom-va-diag-submit.js"></script>




</head>
<body class="body-bgcolor"> 
    <input type="hidden" name="selected_file" value="<%=selected_file %>" id="selected_file" />
    <input type="hidden" name="selected_docType" value="<%=selected_docType %>" id="selected_docType" />

    <div><span class="text-red">*</span>&nbsp;Required</div>
    <br>
    <div style="width:100%; height=98%;">
        <form name="form_submit" action='<%=Request.ServerVariables("SCRIPT_NAME")%>?cmd=upload&accountnumber=<%=AccountNumb%>&docstatus=<%=DocStatus%>&filepath=<%=FilePath%>&doctype=<%=DefaultDocType%>' method="POST" enctype="multipart/form-data">
            <!-- Hidden controls -->
            <input type=hidden name="asp_file" value="Diag" />
            <input type="hidden" name="filepath" value="<%=FilePath%>" id="filePath" />
            <input type="hidden" name="accountnumber" value="<%=AccountNumb %>" id="account_id" />
            <input type="hidden" name="doctype" value="<%=DefaultDocType %>" id="docType" />
            <input type="hidden" name="docstatus" value="<%=DocStatus %>" id="docStatus" />   
           
            <!-- Submit window -->
            <table cellpadding="2" align="center" width="100%" class="table-bordered">
                <thead>
                    <tr class="header-bgcolor">
                        <td colspan="2" align="center">
                            <b>Select the appropriate diagnostic type<span class="text-red">*</span>
                            </b>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td align="left" width="15%" style="border: none; padding: 5px 0 15px 3px;">
                            <select name="selecteddoctype" id="doctype_id" class="vbtn" onchange="diagSubmitVA.docTypeChangeEvent()">
                                <option value="0" data-description="">Select a diagnostic type</option>
                                <%	if (document_type_leng >= 0) then
	                            for i = 0 to ubound(document_type, doctype_row) step 1  %>
                                <option value="<%=document_type(alias_column,i)%>"><%=document_type(code_column,i) %> (<%=document_type(display_column,i)%>)</option>
                                <% Next%>
                                <% end if%>
                            </select>
                            <br>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                                <input type="file" id="file"  name="file" disabled/>
                                <label for="file" id="Submit" class='vbtn disabled'><%=Trim(DocStatus)%></label>
                                <input type='button' id="Cancel" value='Cancel' class='vbtn' onclick="self.close()" />
                        
                            <br />
                                
                            <div id="waiting-msg" style="display: none; text-align: center; margin: 5px; color: darkblue;">
                                <b>Please wait... The file is being uploaded.</b>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>                
        </form>
    </div>

    <form name="form_reports" action="appt_nr_content.asp" method=post>
        <input type=hidden name="file_name" value="" />
        <input type=hidden name="quadis_id" />
        <input type=hidden name="asp_file" value="Diag" />
    </form>
</body>
</html>
