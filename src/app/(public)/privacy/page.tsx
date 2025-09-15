export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl mx-auto py-20 px-4">
            <h1 className="text-4xl font-bold font-headline mb-8">Privacy Policy</h1>
            <div className="prose dark:prose-invert max-w-none">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <h2>1. Introduction</h2>
                <p>Welcome to Academiq. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

                <h2>2. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Service.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</li>
                </ul>

                <h2>3. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Improve our operations and service offerings.</li>
                </ul>

                <h2>4. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: yohanemeka15@gmail.com</p>
            </div>
        </div>
    )
}
