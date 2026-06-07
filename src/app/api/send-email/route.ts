import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with environment variable
// We use a fallback so it doesn't crash during build if the key is missing.
const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_key';
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API Key is missing. Email skipped.' }, { status: 400 });
    }

    const { certId, url } = await req.json();

    if (!certId) {
      return NextResponse.json({ error: 'Missing certId' }, { status: 400 });
    }

    // Secure the API route: Fetch certificate data from Firestore to prevent spam abuse
    const projectId = 'experience-platform-d0019';
    
    // We query the collection to find the document with certId == certId
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'certificates' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'certId' },
              op: 'EQUAL',
              value: { stringValue: certId }
            }
          },
          limit: 1
        }
      })
    });

    if (!queryResponse.ok) {
      return NextResponse.json({ error: 'Failed to verify certificate' }, { status: 500 });
    }

    const queryData = await queryResponse.json();
    if (!queryData || !queryData[0] || !queryData[0].document) {
      return NextResponse.json({ error: 'Certificate not found or invalid' }, { status: 404 });
    }

    const docFields = queryData[0].document.fields;
    const email = docFields.employeeEmail?.stringValue;
    const employeeName = docFields.employeeName?.stringValue;
    const companyName = docFields.companyName?.stringValue || "الشركة";

    if (!email) {
      return NextResponse.json({ error: 'No email associated with this certificate' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Khebrat Platform <onboarding@resend.dev>',
      to: [email],
      subject: `مبروك! شهادة خبرتك من ${companyName} أصبحت جاهزة 🎉`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-w-lg; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #16a34a; font-size: 24px; margin: 0;">منصة خبرات</h1>
          </div>
          <h2 style="font-size: 18px; color: #1f2937;">أهلاً ${employeeName}،</h2>
          <p style="font-size: 16px;">
            يسعدنا إخبارك بأنه تم إصدار وتوثيق شهادة خبرتك بنجاح من قِبل <strong>${companyName}</strong>.
          </p>
          <p style="font-size: 16px; margin-bottom: 30px;">
            رقم اعتماد الشهادة: <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${certId}</span>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              عرض وتحميل الشهادة
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            هذه رسالة تلقائية من منصة خبرات. 
            <br /> لضمان الموثوقية، الشهادة موثقة بباركود ويمكن التحقق منها في أي وقت.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("API error", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
