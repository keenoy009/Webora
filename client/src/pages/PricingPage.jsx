import Navbar from '../components/Navbar'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: '$5',
    credits: '100 credits',
    features: [
      'Upto 20 Creations',
      'Limited Revisions',
      'Basic AI Models',
      'Email Support',
      'Basic Analytics'
    ],
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$19',
    credits: '400 credits',
    features: [
      'Upto 80 Creations',
      'Extended Revisions',
      'Advanced AI Models',
      'Priority Email Support',
      'Advanced Analytics'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: '$49',
    credits: '1000 credits',
    features: [
      'Upto 200 Creations',
      'Increased Revisions',
      'Advanced AI Models',
      'Email + Chat Support',
      'Advanced Analytics'
    ],
    highlighted: false
  }
]

function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16 w-full">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
          <p className="text-gray-400">Start for free and scale up as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 border flex flex-col gap-6 ${
                plan.highlighted
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div>
                <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? 'text-blue-200' : 'text-gray-400'}`}>
                    / {plan.credits}
                  </span>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.highlighted ? 'text-white' : 'text-blue-500'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 rounded-lg font-medium transition ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Buy Now
              </button>

            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Project Creation / Revision consume 5 credits. You can purchase more credits to create more projects.
        </p>

      </div>
    </div>
  )
}

export default PricingPage