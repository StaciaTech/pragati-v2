

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import { LifeBuoy, Search, Mail, Phone, Rocket, GraduationCap } from 'lucide-react';
import { ChatbotWidget } from '@/components/chatbot-widget';


export default function SupportPage() {

  const faqs = [
    {
      question: "How long does validation take?",
      answer: "The AI validation process is typically completed within a few minutes. You will receive an email notification once your report is ready.",
    },
    {
      question: "What does the 'Moderate' verdict mean?",
      answer: "A 'Moderate' verdict indicates that your idea has potential but also has some weaknesses that need to be addressed. The detailed report will provide specific recommendations for improvement.",
    },
    {
      question: "Can I get more credits?",
      answer: "Yes, innovators can request more credits from the 'Request Credits' page, which will be sent to your TTC Coordinator for approval. College Principals can purchase additional credits in the 'Plan & Payment' section.",
    },
     {
      question: "Where can I find my validation report?",
      answer: "Your validation reports are available in the 'My Ideas' section. Click on any idea to view its detailed report.",
    },
  ]

  return (
    <>
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PPT Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
              <li>Ensure your PPT is in `.pptx` format.</li>
              <li>Keep the file size under 10MB for faster processing.</li>
              <li>Use clear, concise language and visuals.</li>
              <li>Include your Idea ID in the first slide.</li>
              <li>Recommended structure: Problem, Solution, Market, Team, Traction (if any).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Understanding Clusters & Presets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Our validation process evaluates your idea across several key clusters.
              Presets allow you to automatically adjust the weightage of these clusters based on your primary goal.
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4">
              <li><b>Balanced:</b> Equal importance to all clusters.</li>
              <li><b>Research:</b> Focuses more on Innovation and Technical Feasibility.</li>
              <li><b>Commercialization:</b> Emphasizes Market Fit and Scalability.</li>
              <li><b>Manual:</b> Gives you full control to set custom weights.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

        <Card>
            <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                         <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get help with any questions or issues.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="mailto:support@staciacorp.com">Send an Email</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Speak directly with our support team.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full">
                <a href="tel:+919363034150">Call Us</a>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Rocket className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Professional Services</CardTitle>
                <CardDescription>For needs beyond standard support.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full" variant="outline">
                <a href="https://staciacorp.com/services" target="_blank" rel="noopener noreferrer">Explore Expert Services</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Upskilling & Learning</CardTitle>
                <CardDescription>Enhance your skills in both tech and non-tech areas.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full" variant="outline">
                <a href="https://edifai.in/" target="_blank" rel="noopener noreferrer">Visit Edifai.in</a>
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
    <ChatbotWidget />
    </>
  );
}

    
