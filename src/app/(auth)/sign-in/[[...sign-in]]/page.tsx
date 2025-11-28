import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <SignIn
      appearance={{
        // 1. Basic Theme Variables (Colors & Radius)
        variables: {
          colorPrimary: '#000000', // Makes the "Continue" button black (modern)
          colorText: '#1a1a1a',
          borderRadius: '0.5rem',  // Matches standard Tailwind rounded-md
        },
        
        // 2. Fine-tune specific elements using Tailwind classes
        elements: {
          card: "shadow-none border border-gray-200 bg-white", // Removes heavy shadow, adds clean border
          headerTitle: "text-2xl font-bold text-gray-900",     // Bigger, bolder title
          headerSubtitle: "text-gray-500",                     // Subtler subtitle
          
          // Style the "Social" buttons (Google/GitHub/GitLab)
          socialButtonsBlockButton: 
            "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 font-medium",
            
          // Style the "Social" icons to be simpler (optional)
          socialButtonsBlockButtonText: "font-semibold",
          
          // Style the Input fields
          formFieldInput: 
            "border-gray-300 focus:ring-black focus:border-black rounded-md",
            
          // Style the Main "Continue" button
          formButtonPrimary: 
            "bg-black hover:bg-gray-800 text-white transition-all duration-200",
            
          // Hide the "Secured by Clerk" footer if you want (optional)
          footerActionLink: "text-black hover:underline",
        },
      }}
    />
  )
}