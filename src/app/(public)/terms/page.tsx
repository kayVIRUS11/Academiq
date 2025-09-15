export default function TermsPage() {
    return (
        <div className="container max-w-4xl mx-auto py-20 px-4">
            <h1 className="text-4xl font-bold font-headline mb-8">Terms of Service</h1>
            <div className="prose dark:prose-invert max-w-none">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <h2>1. Agreement to Terms</h2>
                <p>By using our services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the services. We may modify the Terms at any time, and such modifications shall be effective immediately upon posting of the modified Terms.</p>

                <h2>2. Use of the Service</h2>
                <p>You agree to use our service for lawful purposes only. You are prohibited from posting on or transmitting through the service any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit, profane, hateful, fraudulent, racially, ethnically, or otherwise objectionable, including, but not limited to, any material that encourages conduct that would constitute a criminal offense, give rise to civil liability, or otherwise violate any applicable local, state, national, or international law.</p>

                <h2>3. Accounts</h2>
                <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>

                <h2>4. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: yohanemeka15@gmail.com</p>
            </div>
        </div>
    )
}
