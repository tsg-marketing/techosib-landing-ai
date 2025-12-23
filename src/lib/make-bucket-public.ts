/**
 * Utility to make the S3 'files' bucket public
 * This should only be called once during setup
 */

const MAKE_BUCKET_PUBLIC_URL = "https://functions.poehali.dev/4889ad87-4e40-4135-b708-bf46e2c44285";

export interface MakeBucketPublicResponse {
  success: boolean;
  message?: string;
  bucket?: string;
  endpoint?: string;
  error?: string;
}

export async function makeBucketPublic(): Promise<MakeBucketPublicResponse> {
  try {
    const response = await fetch(MAKE_BUCKET_PUBLIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Standalone execution if run directly with bun/node
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  console.log("Calling function to make bucket public...");
  
  makeBucketPublic().then(result => {
    console.log('\nResponse:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n✓ SUCCESS: Bucket '${result.bucket}' is now public!`);
      console.log(`Endpoint: ${result.endpoint}`);
      console.log(`Message: ${result.message}`);
    } else {
      console.log(`\n✗ FAILED: ${result.error}`);
    }
  }).catch(error => {
    console.error('Error:', error);
  });
}