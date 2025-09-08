
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <p className="text-sm text-muted-foreground">Last updated: September 3, 2025</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <section>
                    <h2>1. Introduction</h2>
                    <p>Welcome to PragatiAI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, in compliance with Indian laws, including the Digital Personal Data Protection (DPDP) Act.</p>
                </section>
                <section>
                    <h2>2. Information We Collect</h2>
                    <p>We may collect personal information such as your name, email, educational institution, and any data you provide when submitting ideas or using our services. We also collect non-personal information like browser type and usage data. Under the DPDP Act, this data is processed lawfully for legitimate purposes.</p>
                </section>
                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our platform.</li>
                        <li>Improve, personalize, and expand our services.</li>
                        <li>Understand and analyze how you use our platform.</li>
                        <li>Develop new products, services, features, and functionality.</li>
                        <li>Communicate with you for customer service, updates, and marketing, with your consent.</li>
                        <li>Process your transactions and manage your account.</li>
                    </ul>
                </section>
                <section>
                    <h2>4. Data Protection and User Rights (DPDP Act)</h2>
                    <p>As a user, you have the right to access your personal data, correct inaccuracies, and request erasure of your data. We act as a Data Fiduciary and ensure that your data is protected with reasonable security safeguards. For any data protection queries or to exercise your rights, please contact our Data Protection Officer.</p>
                </section>
                <section>
                    <h2>5. Sharing Your Information</h2>
                    <p>We do not sell your personal information. We may share information with third-party vendors (Data Processors) that perform services for us, or with your affiliated institution as part of our service agreement. Your idea data is processed by our AI partners but is not used for training their models without your explicit consent.</p>
                </section>
                 <section>
                    <h2>6. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@pragati.ai" className="text-primary hover:underline">privacy@pragati.ai</a>.</p>
                </section>
            </CardContent>
        </Card>
    )
}
