// Simple test script to verify Supabase connection and data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('businesses')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            return;
        }
        
        console.log('✅ Connection successful!');
        
        // Get total count
        const { count } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });
        
        console.log(`📊 Total businesses: ${count}`);
        
        // Get categories
        const { data: categories } = await supabase
            .from('businesses')
            .select('category')
            .not('category', 'is', null);
        
        const categoryCount = {};
        categories.forEach(business => {
            if (business.category) {
                categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
            }
        });
        
        console.log('\n📈 Categories:');
        Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([category, count]) => {
                console.log(`  ${category}: ${count} businesses`);
            });
        
        // Get governorates
        const { data: governorates } = await supabase
            .from('businesses')
            .select('governorate')
            .not('governorate', 'is', null);
        
        const governorateCount = {};
        governorates.forEach(business => {
            if (business.governorate) {
                governorateCount[business.governorate] = (governorateCount[business.governorate] || 0) + 1;
            }
        });
        
        console.log('\n🏛️ Governorates:');
        Object.entries(governorateCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([governorate, count]) => {
                console.log(`  ${governorate}: ${count} businesses`);
            });
        
        // Get sample data
        const { data: sample } = await supabase
            .from('businesses')
            .select('name, nameAr, category, governorate, city, phone, whatsapp, website, rating')
            .limit(3);
        
        console.log('\n📋 Sample businesses:');
        sample.forEach((business, index) => {
            console.log(`${index + 1}. ${business.name} (${business.nameAr || 'No Arabic'})`);
            console.log(`   📱 ${business.phone || 'No Phone'} | 💬 ${business.whatsapp || 'No WhatsApp'}`);
            console.log(`   🌐 ${business.website || 'No Website'} | ⭐ ${business.rating || 'No Rating'}`);
            console.log(`   📍 ${business.city}, ${business.governorate} | 📂 ${business.category}`);
            console.log('');
        });
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testConnection();
