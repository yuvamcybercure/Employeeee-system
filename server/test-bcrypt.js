const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);
    console.log('Password:', password);
    console.log('Hash:', hash);

    const match = await bcrypt.compare(password, hash);
    console.log('Match (Same password):', match);

    const noMatch = await bcrypt.compare('wrongPassword', hash);
    console.log('Match (Wrong password):', noMatch);
};

testBcrypt();
