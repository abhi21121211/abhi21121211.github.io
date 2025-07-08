# PowerShell script to rename blog images
$blogDir = "assets/images/blog"
$files = Get-ChildItem -Path $blogDir

# Define the new names
$newNames = @(
    "blog1.1.webp",  # Already exists
    "blog1.2.webp",
    "blog1.3.webp", 
    "blog2.1.webp",
    "blog2.2.webp",
    "blog2.3.webp",
    "blog3.1.webp",
    "blog3.2.webp",
    "blog3.3.webp",
    "blog4.1.webp",
    "blog4.2.webp",
    "blog4.3.webp",
    "blog5.1.png",
    "blog5.2.png",
    "blog5.3.png",
    "blog6.1.png",
    "blog6.2.png",
    "blog6.3.png",
    "blog7.1.png",
    "blog7.2.png"
)

$counter = 0
foreach ($file in $files) {
    if ($file.Name -ne "blog1.1.webp") {  # Skip the already renamed file
        $newName = $newNames[$counter]
        if ($newName) {
            $newPath = Join-Path $blogDir $newName
            if (!(Test-Path $newPath)) {
                Rename-Item -Path $file.FullName -NewName $newName
                Write-Host "Renamed: $($file.Name) -> $newName"
            } else {
                Write-Host "File $newName already exists, skipping $($file.Name)"
            }
        }
        $counter++
    }
}

Write-Host "Renaming complete!" 