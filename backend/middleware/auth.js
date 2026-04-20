import { createRemoteJWKSet, jwtVerify } from 'jose';

const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'sabtamorg';
const JWKS_URI = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/token`,
    });

    req.userId = payload.sub;
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default verifyToken;