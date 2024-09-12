'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BookOpenIcon, TrophyIcon, BellIcon, Menu, UserIcon, GlobeIcon, MessageCircleIcon, SendIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API client
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

const contentItems = [
  { id: 1, title: "Introduction to Anti-Doping", type: "Video", duration: "10 min", category: "Basics" },
  { id: 2, title: "Common Prohibited Substances", type: "Article", duration: "15 min read", category: "Substances" },
  { id: 3, title: "Athlete Rights and Responsibilities", type: "Interactive Guide", duration: "20 min", category: "Rules" },
  { id: 4, title: "Case Study: Accidental Doping", type: "Podcast", duration: "25 min", category: "Case Studies" },
  { id: 5, title: "Latest WADA Guidelines", type: "PDF", duration: "30 min read", category: "Updates" },
  { id: 6, title: "Nutritional Supplements and Risks", type: "Video", duration: "12 min", category: "Nutrition" },
  { id: 7, title: "Out-of-Competition Testing Procedures", type: "Article", duration: "18 min read", category: "Testing" },
  { id: 8, title: "Mental Health and Doping Prevention", type: "Podcast", duration: "22 min", category: "Wellness" },
]

const languages = [
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'অসমীয়া' },
  { code: 'sd', name: 'سنڌي' },
  { code: 'bh', name: 'भोजपुरी' },
  { code: 'san', name: 'संस्कृत' },
  { code: 'ur', name: 'اردو' },
];

const NavItem = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    {title}
  </button>
)

const ChatMessage = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[70%] p-3 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
      {message}
    </div>
  </div>
)

export default function Home() {
  const [activeSection, setActiveSection] = useState('home')
  const [userPreferences, setUserPreferences] = useState({
    sport: '',
    level: '',
    interests: [],
    languages: ['en'],
  })
  const [recommendedContent, setRecommendedContent] = useState([])
  const [progress, setProgress] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { message: "Hello! How can I assist you with anti-doping information today?", isUser: false }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    // Simulating AI-driven content recommendation
    const recommendContent = () => {
      const userInterests = userPreferences.interests
      const userLevel = userPreferences.level
      
      const recommended = contentItems.filter(item => 
        userInterests.includes(item.category) || 
        (userLevel === 'Beginner' && item.category === 'Basics') ||
        (userLevel === 'Advanced' && ['Case Studies', 'Updates'].includes(item.category))
      ).slice(0, 3)
      
      setRecommendedContent(recommended)
    }

    recommendContent()
  }, [userPreferences])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const updatePreferences = (key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return

    setChatMessages(prev => [...prev, { message: currentMessage, isUser: true }])
    setCurrentMessage('')
    setIsTyping(true)

    try {
      const result = await model.generateContent(currentMessage)
      const response = await result.response
      const text = response.text()
      setChatMessages(prev => [...prev, { message: text, isUser: false }])
    } catch (error) {
      console.error('Error generating response:', error)
      setChatMessages(prev => [...prev, { message: "I'm sorry, I encountered an error. Please try again.", isUser: false }])
    } finally {
      setIsTyping(false)
    }
  }

  const renderPersonalizedDashboard = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Your Personalized Dashboard</h2>
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">You've completed {progress}% of your learning goals</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendedContent.map(item => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.title}</span>
                  <Badge>{item.category}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={userPreferences.sport}
                  onValueChange={(value) => updatePreferences('sport', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athletics">Athletics</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Experience Level</Label>
                <Select
                  value={userPreferences.level}
                  onValueChange={(value) => updatePreferences('level', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interests</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['Basics', 'Substances', 'Rules', 'Nutrition', 'Testing', 'Wellness'].map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={userPreferences.interests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updatePreferences('interests', [...userPreferences.interests, interest])
                          } else {
                            updatePreferences('interests', userPreferences.interests.filter(i => i !== interest))
                          }
                        }}
                      />
                      <Label htmlFor={interest}>{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Preferred Languages</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {languages.map(lang => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang.code}
                        checked={userPreferences.languages.includes(lang.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updatePreferences('languages', [...userPreferences.languages, lang.code])
                          } else {
                            updatePreferences('languages', userPreferences.languages.filter(l => l !== lang.code))
                          }
                        }}
                      />
                      <Label htmlFor={lang.code}>{lang.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderHome = () => (
    <div className="space-y-12">
      <div className="relative h-[300px] rounded-lg overflow-hidden">
        <Image
          src="/placeholder.svg?height=300&width=800"
          alt="Anti-Doping Education"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Anti-Doping Education</h1>
            <p className="text-xl text-white">Learn about anti-doping regulations and best practices</p>
          </div>
        </div>
      </div>
      {renderPersonalizedDashboard()}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <BookOpenIcon className="mr-2" />
              Engaging Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Explore our multimedia content and real-life case studies.</p>
            <Button onClick={() => setActiveSection('content')} className="w-full">Browse Content</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrophyIcon className="mr-2" />
              Interactive Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Take quizzes, participate in forums, and earn certifications.</p>
            <Button onClick={() => setActiveSection('interactive')} className="w-full">Start Learning</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900 dark:to-rose-900">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <BellIcon className="mr-2" />
              Stay Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get real-time updates on anti-doping regulations and news.</p>
            <Button onClick={() => setActiveSection('updates')} className="w-full">Subscribe</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Educational Content</h1>
        <p className="text-xl">Explore our range of anti-doping educational materials</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contentItems.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <Image
              src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(item.title)}`}
              alt={item.title}
              width={400}
              height={200}
              className="w-full object-cover"
            />
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {item.type}</p>
              <p>Duration: {item.duration}</p>
              <Badge className="mt-2">{item.category}</Badge>
              <Button className="mt-4 w-full" onClick={() => setProgress(prev => Math.min(prev + 10, 100))}>
                Access Content
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderInteractive = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Interactive Learning</h1>
        <p className="text-xl">Engage with our interactive features to enhance your understanding</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900 dark:to-violet-900">
          <Image
            src="/placeholder.svg?height=200&width=400&text=Quizzes"
            alt="Quizzes"
            width={400}
            height={200}
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Test your knowledge with our anti-doping quizzes</p>
            <Button className="w-full" onClick={() => setProgress(prev => Math.min(prev + 15, 100))}>Start Quiz</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
          <Image
            src="/placeholder.svg?height=200&width=400&text=Discussion Forums"
            alt="Discussion Forums"
            width={400}
            height={200}
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Discussion Forums</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Join conversations about anti-doping topics</p>
            <Button className="w-full">Enter Forums</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
          <Image
            src="/placeholder.svg?height=200&width=400&text=Live Chat Support"
            alt="Live Chat Support"
            width={400}
            height={200}
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Live Chat Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get real-time answers to your anti-doping questions</p>
            <Button className="w-full" onClick={() => setIsChatOpen(true)}>Start Chat</Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-900">
          <Image
            src="/placeholder.svg?height=200&width=400&text=Certifications"
            alt="Certifications"
            width={400}
            height={200}
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Earn badges and certificates for completed modules</p>
            <div className="flex justify-center space-x-2">
              <Badge variant="secondary">Beginner</Badge>
              <Badge variant="secondary">Intermediate</Badge>
              <Badge variant="secondary">Expert</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUpdates = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Stay Updated</h1>
        <p className="text-xl">Get the latest anti-doping news and updates</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="regulations" />
                <Label htmlFor="regulations">Regulation Changes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="news" />
                <Label htmlFor="news">Anti-Doping News</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="events" />
                <Label htmlFor="events">Upcoming Events</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
          <CardHeader>
            <CardTitle>Newsletter Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Subscribe to our monthly newsletter for comprehensive updates</p>
            <Button className="w-full">Subscribe</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>New WADA prohibited list published</li>
            <li>Upcoming webinar on nutritional supplements</li>
            <li>Changes to out-of-competition testing procedures</li>
          </ul>
        </CardContent>
      </Card>
      <div className="relative h-[300px] rounded-lg overflow-hidden">
        <Image
          src="/placeholder.svg?height=300&width=800&text=Stay Informed"
          alt="Stay Informed"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay Informed, Stay Clean</h2>
            <p className="text-xl">Your journey to fair sport starts here</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <a href="#" className="flex items-center space-x-2">
              <TrophyIcon className="h-6 w-6" />
              <span className="inline-block font-bold">Anti-Doping Ed</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1 hidden md:flex">
              <NavItem
                title="Home"
                isActive={activeSection === 'home'}
                onClick={() => setActiveSection('home')}
              />
              <NavItem
                title="Content"
                isActive={activeSection === 'content'}
                onClick={() => setActiveSection('content')}
              />
              <NavItem
                title="Interactive"
                isActive={activeSection === 'interactive'}
                onClick={() => setActiveSection('interactive')}
              />
              <NavItem
                title="Updates"
                isActive={activeSection === 'updates'}
                onClick={() => setActiveSection('updates')}
              />
            </nav>
            <Button variant="ghost" size="icon" className="mr-2">
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>
            <Button variant="ghost" size="icon" className="mr-2">
              <GlobeIcon className="h-5 w-5" />
              <span className="sr-only">Language settings</span>
            </Button>
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setIsChatOpen(true)}>
              <MessageCircleIcon className="h-5 w-5" />
              <span className="sr-only">Open chat</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  <NavItem
                    title="Home"
                    isActive={activeSection === 'home'}
                    onClick={() => {
                      setActiveSection('home')
                      document.querySelector('[data-radix-collection-item]')?.click()
                    }}
                  />
                  <NavItem
                    title="Content"
                    isActive={activeSection === 'content'}
                    onClick={() => {
                      setActiveSection('content')
                      document.querySelector('[data-radix-collection-item]')?.click()
                    }}
                  />
                  <NavItem
                    title="Interactive"
                    isActive={activeSection === 'interactive'}
                    onClick={() => {
                      setActiveSection('interactive')
                      document.querySelector('[data-radix-collection-item]')?.click()
                    }}
                  />
                  <NavItem
                    title="Updates"
                    isActive={activeSection === 'updates'}
                    onClick={() => {
                      setActiveSection('updates')
                      document.querySelector('[data-radix-collection-item]')?.click()
                    }}
                  />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8">
        {activeSection === 'home' && renderHome()}
        {activeSection === 'content' && renderContent()}
        {activeSection === 'interactive' && renderInteractive()}
        {activeSection === 'updates' && renderUpdates()}
      </main>
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-background border rounded-lg shadow-lg flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">Anti-Doping Chat Support</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
              <span className="sr-only">Close chat</span>
              &times;
            </Button>
          </div>
          <ScrollArea className="flex-grow p-4">
            {chatMessages.map((msg, index) => (
              <ChatMessage key={index} message={msg.message} isUser={msg.isUser} />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
              <Button type="submit">
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}