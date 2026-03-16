const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'android/app/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
    let content = fs.readFileSync(manifestPath, 'utf8');
    
    const permissions = `
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" />`;

    if (!content.includes('android.permission.ACCESS_FINE_LOCATION')) {
        content = content.replace('</manifest>', `${permissions}\n</manifest>`);
        fs.writeFileSync(manifestPath, content);
        console.log('Successfully added location permissions to AndroidManifest.xml');
    } else {
        console.log('Location permissions already exist in AndroidManifest.xml');
    }
} else {
    console.error('AndroidManifest.xml not found at ' + manifestPath);
}
