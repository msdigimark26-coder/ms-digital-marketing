import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import CEOCard from '@/components/CEOCard';
import { motion } from 'framer-motion';

const CEO = () => {
  const [contactMessage, setContactMessage] = useState('');

  const handleCEOContact = () => {
    setContactMessage('Meeting request sent! Our team will reach out shortly.');
    setTimeout(() => setContactMessage(''), 3000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-20 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Leadership
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Meet our visionary leader driving innovation and strategy
          </p>
        </motion.div>

        {/* CEO Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center items-center px-4"
        >
          <div className="w-full max-w-md">
            <CEOCard
              name="Sai Sankara"
              avatarUrl="/Team Members 2/1.png"
              miniAvatarUrl="/Team Members 2/1.png"
              handle="sai_sankara"
              status="Available"
              contactText="Schedule Meeting"
              onContactClick={handleCEOContact}
              enableTilt={true}
              enableMobileTilt={false}
            />
          </div>
        </motion.div>

        {/* Contact Message */}
        {contactMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-center"
          >
            {contactMessage}
          </motion.div>
        )}

        {/* About CEO Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto px-4"
        >
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">About Sai Sankara</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                As Chief Executive Officer, Sai Sankara brings over a decade of experience in digital transformation and strategic business development. His vision has positioned our organization as a leader in digital marketing innovation.
              </p>
              <p>
                With expertise spanning across SEO, Content Marketing, Social Media Strategy, and Paid Advertising, Sai leads our team with a data-driven approach to delivering exceptional results for our clients.
              </p>
              <h3 className="text-xl font-semibold text-yellow-400 mt-6 mb-3">Key Areas of Expertise:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  Digital Marketing Strategy
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  Business Development
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  SEO & Content Marketing
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  Brand Strategy & Growth
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  Team Leadership
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-3">→</span>
                  Client Success & Satisfaction
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-600/30 border border-yellow-600/50 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Want to Connect?</h3>
            <p className="text-gray-300 mb-6">
              Have questions or want to discuss how we can help grow your business?
            </p>
            <button
              onClick={handleCEOContact}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300"
            >
              Schedule an Appointment
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CEO;
