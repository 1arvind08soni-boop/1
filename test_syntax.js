try {
    require('./app.js');
    console.log('No syntax errors');
} catch(e) {
    console.log('Error:', e.message);
    console.log('Stack:', e.stack.split('\n').slice(0,5).join('\n'));
}
