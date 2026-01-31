import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface CategoryCardProps {
  name: string
  slug: string
  icon: string
  count: number
  color: string
}

export function CategoryCard({ name, slug, icon, count, color }: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`}>
      <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
        <CardContent className="p-4 text-center">
          <div 
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <h3 className="font-medium text-sm text-gray-900 group-hover:text-lobster-600 transition-colors mb-1">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {count} listings
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
