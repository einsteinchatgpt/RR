# Converte RR_Dados.xlsx em dados.js (var DADOS_RR) e dados.json
# Nao requer Node/Python/Excel: le o xlsx (zip + XML) usando apenas .NET.
# Uso: powershell -ExecutionPolicy Bypass -File convert_xlsx.ps1
param(
    [string]$Xlsx   = "$PSScriptRoot\RR_Dados.xlsx",
    [string]$OutJs  = "$PSScriptRoot\dados.js",
    [string]$OutJson = "$PSScriptRoot\dados.json"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
$zip = [System.IO.Compression.ZipFile]::OpenRead($Xlsx)

function Read-Entry {
    param([string]$Name)
    $e = $zip.GetEntry($Name)
    if ($null -eq $e) { throw "Entrada nao encontrada no xlsx: $Name" }
    $sr = New-Object System.IO.StreamReader($e.Open(), [System.Text.Encoding]::UTF8)
    $t = $sr.ReadToEnd()
    $sr.Close()
    return $t
}

function New-Xml {
    param([string]$Text)
    $doc = New-Object System.Xml.XmlDocument
    $doc.PreserveWhitespace = $true
    $doc.LoadXml($Text)
    return $doc
}

# --- shared strings ---
$ssDoc = New-Xml (Read-Entry 'xl/sharedStrings.xml')
$shared = New-Object System.Collections.ArrayList
foreach ($si in $ssDoc.SelectNodes("//*[local-name()='si']")) {
    $sb = ''
    foreach ($t in $si.SelectNodes(".//*[local-name()='t']")) { $sb += $t.InnerText }
    [void]$shared.Add($sb)
}

function Get-ColIndex {
    param([string]$Ref)
    $letters = ([regex]::Match($Ref, '^([A-Z]+)')).Groups[1].Value
    $idx = 0
    foreach ($ch in $letters.ToCharArray()) { $idx = $idx * 26 + ([int][char]$ch - 64) }
    return $idx
}

function Get-CellValue {
    param([System.Xml.XmlElement]$C)
    $t = $C.GetAttribute('t')
    if ($t -eq 'inlineStr') {
        $sb = ''
        foreach ($node in $C.SelectNodes(".//*[local-name()='t']")) { $sb += $node.InnerText }
        return $sb
    }
    $vNode = $C.SelectSingleNode("*[local-name()='v']")
    if ($null -eq $vNode) { return $null }
    $raw = $vNode.InnerText
    switch ($t) {
        's'   { return [string]$shared[[int]$raw] }
        'str' { return [string]$raw }
        'b'   { return ($raw -eq '1') }
        default {
            if ($raw -eq '') { return $null }
            if ($raw -match '^-?\d+$') { return [long]$raw }
            return [double]::Parse($raw, [System.Globalization.CultureInfo]::InvariantCulture)
        }
    }
}

function Parse-Sheet {
    param([string]$SheetPath)
    $doc = New-Xml (Read-Entry $SheetPath)
    $rows = @{}
    foreach ($row in $doc.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']")) {
        $rn = [int]$row.GetAttribute('r')
        $cells = @{}
        foreach ($c in $row.SelectNodes("*[local-name()='c']")) {
            $ci = Get-ColIndex $c.GetAttribute('r')
            $cells[$ci] = Get-CellValue $c
        }
        $rows[$rn] = $cells
    }
    return $rows
}

function Build-Records {
    param($Rows)
    $rowNums = $Rows.Keys | Sort-Object
    $headerCells = $Rows[1]
    $maxCol = ($headerCells.Keys | Measure-Object -Maximum).Maximum

    $headers = New-Object System.Collections.ArrayList
    for ($ci = 1; $ci -le $maxCol; $ci++) {
        $h = if ($headerCells.ContainsKey($ci)) { [string]$headerCells[$ci] } else { '' }
        [void]$headers.Add($h)
    }

    $records = New-Object System.Collections.ArrayList
    foreach ($rn in ($rowNums | Where-Object { $_ -ge 2 })) {
        $cells = $Rows[$rn]
        $obj = [ordered]@{}
        for ($ci = 1; $ci -le $maxCol; $ci++) {
            $h = [string]$headerCells[$ci]
            if ([string]::IsNullOrEmpty($h)) { continue }
            $val = if ($cells.ContainsKey($ci)) { $cells[$ci] } else { $null }
            $obj[$h] = $val   # cabecalho duplicado: ultima coluna prevalece
        }
        [void]$records.Add($obj)
    }
    return [pscustomobject]@{ Headers = $headers; Records = $records }
}

# sheet1 = Capital, sheet2 = Centro Norte (ver xl/workbook.xml)
$capital     = Build-Records (Parse-Sheet 'xl/worksheets/sheet1.xml')
$centroNorte = Build-Records (Parse-Sheet 'xl/worksheets/sheet2.xml')
$zip.Dispose()

$out = [ordered]@{
    centroNorte        = @($centroNorte.Records)
    capital            = @($capital.Records)
    headersCapital     = @($capital.Headers)
    headersCentroNorte = @($centroNorte.Headers)
}

$json = $out | ConvertTo-Json -Depth 50

# Grava em UTF-8 sem BOM (preserva acentos; HTML usa <meta charset="UTF-8">).
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutJs,   ("var DADOS_RR = " + $json + ";"), $utf8)
[System.IO.File]::WriteAllText($OutJson, $json, $utf8)

Write-Output ("Capital: {0} registros, {1} colunas" -f $capital.Records.Count, $capital.Headers.Count)
Write-Output ("Centro Norte: {0} registros, {1} colunas" -f $centroNorte.Records.Count, $centroNorte.Headers.Count)
Write-Output ("Gerado: {0} e {1}" -f $OutJs, $OutJson)
