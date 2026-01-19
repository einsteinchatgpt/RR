$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8085/")
$listener.Start()
Write-Host "Servidor iniciado em http://localhost:8085" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    $filePath = Join-Path $PSScriptRoot $path.TrimStart("/")
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        
        $contentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".js" { "application/javascript; charset=utf-8" }
            ".css" { "text/css; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            ".xlsx" { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
            default { "application/octet-stream" }
        }
        
        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
        Write-Host "200 OK: $path" -ForegroundColor Green
    } else {
        $response.StatusCode = 404
        Write-Host "404 Not Found: $path" -ForegroundColor Red
    }
    
    $response.Close()
}
