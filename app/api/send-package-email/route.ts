import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseAdminServer'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerEmail } = await request.json()
    
    if (!sessionId || !customerEmail) {
      return NextResponse.json({ error: 'Session ID and customer email are required' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient()

    // 1. Session ID'den paket bilgilerini çek
    const { data: purchases, error: purchaseError } = await admin
      .from('purchases')
      .select('package_name, user_email')
      .eq('stripe_session_id', sessionId)
      .eq('user_email', customerEmail.toLowerCase())
      .limit(1)

    if (purchaseError || !purchases || purchases.length === 0) {
      console.error('Purchase not found:', purchaseError)
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    const purchase = purchases[0]
    const packageName = purchase.package_name

    // 2. Package detaylarını veri tabanından çek
    const { data: packageDetails, error: packageError } = await admin
      .from('package_details')
      .select('*')
      .eq('title', packageName)
      .limit(1)

    let packageContent = null
    if (!packageError && packageDetails && packageDetails.length > 0) {
      packageContent = packageDetails[0]
    } else {
      // Fallback: packages tablosundan çek
      const { data: packages, error: packagesError } = await admin
        .from('packages')
        .select('*')
        .eq('title', packageName)
        .eq('is_active', true)
        .limit(1)

      if (!packagesError && packages && packages.length > 0) {
        packageContent = packages[0]
      }
    }

    if (!packageContent) {
      return NextResponse.json({ error: 'Package details not found' }, { status: 404 })
    }

    // 3. Email içeriğini hazırla
    const emailContent = generateEmailContent(packageContent, packageName)

    // 4. Email gönder (şu an için console log, sonra gerçek email servisi ekleyeceğiz)
    console.log('=== EMAIL CONTENT ===')
    console.log('To:', customerEmail)
    console.log('Subject:', packageName)
    console.log('Content:', emailContent)
    console.log('====================')

    // Şimdilik başarılı response dön, gerçek email servisi sonra eklenecek
    return NextResponse.json({ 
      success: true, 
      message: 'Package content email prepared (logged to console)',
      packageName,
      customerEmail
    })

  } catch (error) {
    console.error('Error in send-package-email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateEmailContent(packageData: any, packageName: string): string {
  const features = packageData.features || []
  const specifications = packageData.specifications || []
  const recommendations = packageData.recommendations || []
  const longDescription = packageData.long_description || packageData.description || ''

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${packageName} - Content Details</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .highlight { background: #e6fffa; padding: 15px; border-left: 4px solid #38b2ac; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 ${packageName}</h1>
            <p>Thank you for your purchase!</p>
        </div>
        
        <div class="content">
            <div class="highlight">
                <strong>Package Content:</strong> Below are all the details of the package you purchased.
            </div>

            <div class="section">
                <h3>📋 Program Overview</h3>
                <p>${longDescription}</p>
            </div>

            ${features.length > 0 ? `
            <div class="section">
                <h3>⭐ Key Features</h3>
                <ul>
                    ${features.map((feature: string) => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${specifications.length > 0 ? `
            <div class="section">
                <h3>📊 Program Specifications</h3>
                <ul>
                    ${specifications.map((spec: string) => `<li>${spec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${recommendations.length > 0 ? `
            <div class="section">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="section">
                <h3>📦 What's Included in Your Package</h3>
                <div style="display: grid; gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 10px 0; color: #2d3748;">📋 Workout Plans</h4>
                        <ul style="margin: 0;">
                            <li>Detailed exercise instructions</li>
                            <li>Progressive training schedules</li>
                            <li>Video demonstrations</li>
                            <li>Modification options</li>
                        </ul>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 10px 0; color: #2d3748;">🥗 Nutrition Guide</h4>
                        <ul style="margin: 0;">
                            <li>Customized meal plans</li>
                            <li>Macro calculations</li>
                            <li>Recipe collections</li>
                            <li>Supplement guidance</li>
                        </ul>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 10px 0; color: #2d3748;">📊 Progress Tracking</h4>
                        <ul style="margin: 0;">
                            <li>Body measurement charts</li>
                            <li>Progress photo guides</li>
                            <li>Performance metrics</li>
                            <li>Achievement milestones</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="highlight">
                <h4 style="margin: 0 0 10px 0;">💬 Support & Community</h4>
                <p style="margin: 0;">Access to our private community forum, weekly Q&A sessions, and direct support from certified trainers. Your success is our priority!</p>
            </div>
        </div>

        <div class="footer">
            <p>Your journey to success with Forever Elite Fitness has begun! 💪</p>
            <p><a href="mailto:support@foreverelite.com">Contact us for support</a></p>
        </div>
    </div>
</body>
</html>
  `.trim()
}
