import {
    Font,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text
} from '@react-email/components';

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: 'https://fonts.googleapis.com/css?family=Roboto:400,700',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Your verification code for account confirmation</Preview>
            <Section style={main}>
                <Section style={container}>
                    <Heading style={h1}>Email Verification</Heading>
                    <Text style={text}>Hello {username},</Text>
                    <Text style={text}>
                        Thank you for signing up! Please use the following verification code to complete your registration:
                    </Text>
                    <Section style={otpContainer}>
                        <Text style={otpText}>{otp}</Text>
                    </Section>
                    <Text style={text}>
                        This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                    </Text>
                    <Text style={footer}>
                        Best regards,<br />
                        The Team
                    </Text>
                </Section>
            </Section>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    textAlign: 'center' as const,
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 24px',
};

const otpContainer = {
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    margin: '32px 24px',
    padding: '24px',
    textAlign: 'center' as const,
};

const otpText = {
    color: '#000',
    fontSize: '32px',
    fontWeight: 'bold',
    letterSpacing: '8px',
    lineHeight: '40px',
    margin: '0',
};

const footer = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '24px 24px 0',
};
        